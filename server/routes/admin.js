import express from 'express';
import User from '../models/User.js';
import Report from '../models/Report.js';
import Match from '../models/Match.js';
import Subscription from '../models/Subscription.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true, lastSeen: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const totalMatches = await Match.countDocuments({ isActive: true });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const totalRevenue = (await Subscription.aggregate([{ $match: { status: 'active' } }, { $group: { _id: null, total: { $sum: '$price' } } }]))[0]?.total || 0;

    const userGrowth = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } }, { $limit: 30 },
    ]);

    res.json({ success: true, stats: { totalUsers, activeUsers, premiumUsers, totalMatches, pendingReports, totalRevenue, userGrowth } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (status === 'banned') filter.isBanned = true;
    if (status === 'premium') filter.isPremium = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true, isActive: false }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/reports
router.get('/reports', protect, adminOnly, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const reports = await Report.find({ status })
      .populate('reporter', 'name avatar email')
      .populate('reported', 'name avatar email')
      .sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/reports/:id
router.put('/reports/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status, adminNote, reviewedBy: req.user._id, reviewedAt: new Date() }, { new: true });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
