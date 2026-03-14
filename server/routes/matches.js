import express from 'express';
import Match from '../models/Match.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/matches
router.get('/', protect, async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user._id, isActive: true })
      .populate('users', 'name avatar age bio isOnline lastSeen photos')
      .sort({ updatedAt: -1 });

    const formatted = matches.map(m => {
      const otherUser = m.users.find(u => u._id.toString() !== req.user._id.toString());
      return { ...m.toObject(), otherUser };
    });

    res.json({ success: true, matches: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/matches/:id (unmatch)
router.delete('/:id', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    if (!match.users.includes(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });

    match.isActive = false;
    match.unmatchedBy = req.user._id;
    match.unmatchedAt = new Date();
    await match.save();
    res.json({ success: true, message: 'Unmatched' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
