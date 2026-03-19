import express from 'express';
import Like from '../models/Like.js';
import Match from '../models/Match.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { calculateCompatibility } from '../utils/helpers.js';
import User from '../models/User.js';

const router = express.Router();

// POST /api/likes/:id
router.post('/:id', protect, async (req, res) => {
  try {
    const { type = 'like' } = req.body;
    const toUserId = req.params.id;
    const fromUserId = req.user._id;

    if (toUserId === fromUserId.toString()) {
      return res.status(400).json({ success: false, message: "Can't like yourself" });
    }

    const user = await User.findById(fromUserId);
    
    // Reset daily counters if it's a new day
    const now = new Date();
    const lastReset = new Date(user.lastLikeReset || 0);
    if (now.toDateString() !== lastReset.toDateString()) {
      user.dailyLikes = 0;
      user.dailySuperLikes = 0;
      user.lastLikeReset = now;
      await user.save();
    }

    // Check Limits
    if (type === 'like' && !user.isPremium && user.dailyLikes >= 10) {
      return res.status(403).json({ 
        success: false, 
        message: 'Daily like limit reached. Upgrade for unlimited likes!',
        code: 'LIMIT_REACHED'
      });
    }

    if (type === 'superlike') {
      const superLimit = user.premiumTier === 'platinum' ? 10 : (user.premiumTier === 'gold' ? 5 : 1);
      if (user.dailySuperLikes >= superLimit) {
        return res.status(403).json({ 
          success: false, 
          message: `Daily superlike limit (${superLimit}) reached. Upgrade for more!`,
          code: 'LIMIT_REACHED'
        });
      }
    }

    // Increment counters
    if (type === 'like' && !user.isPremium) user.dailyLikes += 1;
    if (type === 'superlike') user.dailySuperLikes += 1;
    await user.save();

    const existing = await Like.findOne({ from: fromUserId, to: toUserId });
    if (existing) return res.status(400).json({ success: false, message: 'Already liked' });

    const like = await Like.create({ from: fromUserId, to: toUserId, type });

    // Check for mutual like (match!)
    const mutualLike = await Like.findOne({ from: toUserId, to: fromUserId });
    let match = null;

    if (mutualLike) {
      like.isMatched = true;
      mutualLike.isMatched = true;
      await like.save();
      await mutualLike.save();

      const fromUser = user;
      const toUser = await User.findById(toUserId);
      const { score, breakdown } = calculateCompatibility(fromUser, toUser);

      match = await Match.create({
        users: [fromUserId, toUserId],
        compatibility: score,
        compatibilityBreakdown: breakdown,
      });

      // Send notifications
      const io = req.app.get('io');
      
      // Notify recipient (toUserId)
      const toUserIsPremium = (await User.findById(toUserId).select('isPremium')).isPremium;
      const matchTitle = 'New Match! 🎉';
      const matchBody = toUserIsPremium ? `You matched with ${fromUser.name}!` : "You have a new match! Upgrade to see who.";
      
      await Notification.create({ 
        user: toUserId, 
        type: 'match', 
        title: matchTitle, 
        body: matchBody, 
        fromUser: fromUserId 
      });

      // Notify sender (fromUserId - usually current user, but let's be safe)
      await Notification.create({ 
        user: fromUserId, 
        type: 'match', 
        title: 'New Match! 🎉', 
        body: `You matched with ${toUser.name}!`, 
        fromUser: toUserId 
      });

      if (io) {
        io.to(`user_${toUserId}`).emit('new_match', { match, user: toUserIsPremium ? fromUser : { ...fromUser.toObject(), name: '?', avatar: fromUser.avatar } });
        io.to(`user_${fromUserId}`).emit('new_match', { match, user: toUser });
      }
    } else {
      // Notify the liked user
      const toUser = await User.findById(toUserId).select('isPremium');
      if (type === 'superlike') {
        const title = toUser.isPremium ? 'Someone Super Liked you! ⭐' : 'New Super Like! ⭐';
        const body = toUser.isPremium ? `${user.name} super liked you!` : 'Someone super liked you! Upgrade to see who.';
        await Notification.create({ user: toUserId, type: 'superlike', title, body, fromUser: fromUserId });
      } else {
        // Optional: Simple like notification
        const title = toUser.isPremium ? `${user.name} liked you!` : 'Someone liked you! ❤️';
        await Notification.create({ user: toUserId, type: 'like', title, fromUser: fromUserId });
      }
    }

    res.json({ success: true, like, match, isMatch: !!match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/likes/received
router.get('/received', protect, async (req, res) => {
  try {
    const likes = await Like.find({ to: req.user._id, isMatched: false })
      .populate('from', 'name avatar age bio photos')
      .sort({ createdAt: -1 });
    const isPremium = req.user.isPremium;
    
    const formatted = likes.map(like => {
      if (!isPremium) {
        return {
          _id: like._id,
          from: {
            _id: like.from._id,
            avatar: like.from.avatar, // Blurred on frontend, but we keep it so they see 'someone' exists
            name: '?', // Redacted
            age: '??', // Redacted
            isPremium: like.from.isPremium
          },
          createdAt: like.createdAt,
          type: like.type
        };
      }
      return like;
    });

    res.json({ success: true, likes: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
