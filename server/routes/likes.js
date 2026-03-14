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

      const fromUser = await User.findById(fromUserId);
      const toUser = await User.findById(toUserId);
      const { score, breakdown } = calculateCompatibility(fromUser, toUser);

      match = await Match.create({
        users: [fromUserId, toUserId],
        compatibility: score,
        compatibilityBreakdown: breakdown,
      });

      // Send notifications
      const io = req.app.get('io');
      await Notification.create({ user: toUserId, type: 'match', title: 'New Match! 🎉', body: `You matched with ${fromUser.name}!`, fromUser: fromUserId });
      await Notification.create({ user: fromUserId, type: 'match', title: 'New Match! 🎉', body: `You matched with ${toUser.name}!`, fromUser: toUserId });

      if (io) {
        io.to(`user_${toUserId}`).emit('new_match', { match, user: fromUser });
        io.to(`user_${fromUserId}`).emit('new_match', { match, user: toUser });
      }
    } else {
      // Notify the liked user
      if (type === 'superlike') {
        await Notification.create({ user: toUserId, type: 'superlike', title: 'Someone Super Liked you! ⭐', fromUser: fromUserId });
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
    res.json({ success: true, likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
