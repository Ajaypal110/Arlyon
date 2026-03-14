import express from 'express';
import Message from '../models/Message.js';
import Match from '../models/Match.js';
import { protect } from '../middleware/auth.js';
import { uploadMedia } from '../utils/cloudinary.js';

const router = express.Router();

// GET /api/messages/:matchId
router.get('/:matchId', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const match = await Match.findById(req.params.matchId);
    if (!match || !match.users.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.find({ match: req.params.matchId, isDeleted: false })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ match: req.params.matchId, isDeleted: false });
    res.json({ success: true, messages: messages.reverse(), total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messages/:matchId
router.post('/:matchId', protect, async (req, res) => {
  try {
    const { content, type = 'text', imageUrl, videoUrl, voiceUrl, voiceDuration } = req.body;
    const match = await Match.findById(req.params.matchId);
    if (!match || !match.users.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await Message.create({
      match: req.params.matchId, sender: req.user._id,
      content, type, imageUrl, videoUrl, voiceUrl, voiceDuration,
      readBy: [req.user._id],
    });

    const populated = await message.populate('sender', 'name avatar');

    // Emit via socket
    const io = req.app.get('io');
    const recipientId = match.users.find(u => u.toString() !== req.user._id.toString());
    if (io) {
      // Personal notification (for unread count/toasts)
      io.to(`user_${recipientId}`).emit('new_notification', { type: 'message', matchId: req.params.matchId });
      // Match room update (for the active chat window)
      io.to(`match_${req.params.matchId}`).emit('new_message', populated);
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messages/upload
router.post('/upload/media', protect, async (req, res) => {
  try {
    const { file } = req.body; // base64
    const uploadRes = await uploadMedia(file);
    res.json({ success: true, url: uploadRes.secure_url, resource_type: uploadRes.resource_type });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/messages/:id
router.post('/:id/edit', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const msg = await Message.findById(req.params.id).populate('match');
    
    if (!msg || msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    msg.content = content;
    msg.isEdited = true;
    msg.editedAt = new Date();
    await msg.save();

    const populated = await msg.populate('sender', 'name avatar');

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`match_${msg.match._id}`).emit('message_edited', populated);
    }

    res.json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/messages/match/:matchId/read
router.put('/match/:matchId/read', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { match: req.params.matchId, sender: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    
    // Emit via socket to inform sender
    const io = req.app.get('io');
    if (io) {
      io.to(`match_${req.params.matchId}`).emit('messages_read', { matchId: req.params.matchId, userId: req.user._id });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/messages/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    
    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      const msg = await Message.findById(req.params.id);
      io.to(`match_${msg.match.toString()}`).emit('message_read', { messageId: req.params.id, userId: req.user._id });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/messages/:id/react
router.put('/:id/react', protect, async (req, res) => {
  try {
    const { emoji } = req.body;
    const msg = await Message.findById(req.params.id);
    const existingIdx = msg.reactions.findIndex(r => r.user.toString() === req.user._id.toString());
    if (existingIdx >= 0) msg.reactions[existingIdx].emoji = emoji;
    else msg.reactions.push({ user: req.user._id, emoji });
    await msg.save();
    res.json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg || msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    msg.isDeleted = true;
    msg.deletedAt = new Date();
    await msg.save();

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`match_${msg.match.toString()}`).emit('message_deleted', { messageId: req.params.id, matchId: msg.match });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
