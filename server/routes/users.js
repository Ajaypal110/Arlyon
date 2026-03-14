import express from 'express';
import User from '../models/User.js';
import Like from '../models/Like.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { uploadImage } from '../utils/cloudinary.js';

const router = express.Router();

// GET /api/users/profile/:id
router.get('/profile/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-refreshToken -resetPasswordToken -emailVerificationToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Increment views if viewing someone else
    if (req.params.id !== req.user._id.toString()) {
      await User.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'dateOfBirth', 'age', 'gender', 'genderPreference', 'interests', 'lifestyle', 'lookingFor', 'ageRange', 'maxDistance', 'location', 'personalityTraits', 'currentMood'];
    const user = await User.findById(req.user._id);
    
    Object.keys(req.body).forEach(key => {
      if (allowed.includes(key)) {
        if (key === 'location' && req.body.location) {
          user.location = {
            type: 'Point',
            coordinates: req.body.location.coordinates || user.location?.coordinates || [0, 0],
            city: req.body.location.city !== undefined ? req.body.location.city : user.location?.city,
            country: req.body.location.country !== undefined ? req.body.location.country : user.location?.country,
          };
        } else {
          user[key] = req.body[key];
        }
      }
    });

    user.calculateProfileCompletion();
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/onboarding
router.post('/onboarding', protect, async (req, res) => {
  try {
    const { name, dateOfBirth, gender, genderPreference, interests, lookingFor, bio, location } = req.body;
    const user = await User.findById(req.user._id);

    let updatedLocation = user.location;
    if (location) {
      updatedLocation = {
        type: 'Point',
        coordinates: location.coordinates || user.location?.coordinates || [0, 0],
        city: location.city !== undefined ? location.city : user.location?.city,
        country: location.country !== undefined ? location.country : user.location?.country,
      };
    }

    Object.assign(user, { name, dateOfBirth, gender, genderPreference, interests, lookingFor, bio, location: updatedLocation, isOnboarded: true });
    if (dateOfBirth) {
      const today = new Date();
      const birth = new Date(dateOfBirth);
      user.age = today.getFullYear() - birth.getFullYear();
    }
    user.calculateProfileCompletion();
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/avatar
router.post('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body; // base64 string
    
    // Upload base64 to cloudinary
    try {
      const uploadRes = await uploadImage(avatar);
      const user = await User.findByIdAndUpdate(req.user._id, { avatar: uploadRes.secure_url }, { new: true });
      res.json({ success: true, user });
    } catch (uploadError) {
      return res.status(400).json({ success: false, message: uploadError.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/discover
router.get('/discover', protect, async (req, res) => {
  try {
    const { minAge, maxAge, gender, interests, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    // Get users already liked/passed
    const likedIds = (await Like.find({ from: userId })).map(l => l.to);

    const filter = {
      _id: { $nin: [...likedIds, userId] },
      isOnboarded: true,
      isActive: true,
      isBanned: false,
    };

    if (gender && gender !== 'everyone') filter.gender = gender;
    else if (req.user.genderPreference !== 'everyone') filter.gender = req.user.genderPreference;

    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('name age gender avatar photos bio interests location trustScore profileCompletion isPhotoVerified isPremium currentMood')
      .sort({ boostActive: -1, trustScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({ success: true, users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/block/:id
router.post('/block/:id', protect, async (req, res) => {
  try {
    // Simply remove matches and likes between users
    await Like.deleteMany({ $or: [{ from: req.user._id, to: req.params.id }, { from: req.params.id, to: req.user._id }] });
    res.json({ success: true, message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Profile Views
    const user = await User.findById(userId).select('views profileCompletion');
    
    // 2. Total Matches
    const totalMatches = await Match.countDocuments({ 
      users: userId,
      isActive: true 
    });

    // 3. Total Messages
    const totalMessages = await Message.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    // 4. Recent Matches
    const recentMatchesRaw = await Match.find({ users: userId, isActive: true })
      .populate('users', 'name age avatar photos currentMood')
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentMatches = recentMatchesRaw.map(m => {
      const otherUser = m.users.find(u => u._id.toString() !== userId.toString());
      return {
        _id: m._id,
        name: otherUser.name,
        age: otherUser.age,
        avatar: otherUser.avatar,
        compatibility: m.compatibilityScore || 0,
        time: m.updatedAt,
        otherUserId: otherUser._id
      };
    });

    // 5. Activity Feed (Mocked for now based on recent matches and messages)
    const activities = [
      { type: 'match', text: 'You have a new match!', time: 'Recently', icon: 'Heart', color: 'text-secondary' },
      { type: 'message', text: 'New messages waiting', time: 'Just now', icon: 'MessageCircle', color: 'text-primary' }
    ];

    res.json({
      success: true,
      stats: {
        profileViews: user.views || 0,
        matches: totalMatches,
        messages: totalMessages,
        compatibilityAvg: '85%', // Mocked for now
        profileCompletion: user.profileCompletion || 0
      },
      recentMatches,
      activities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
