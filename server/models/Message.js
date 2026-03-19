import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'video', 'voice', 'system', 'game', 'call', 'file', 'contact'], default: 'text' },
  imageUrl: String,
  videoUrl: String,
  voiceUrl: String,
  voiceDuration: Number,
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  contactData: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    avatar: String
  },
  callData: {
    type: { type: String, enum: ['audio', 'video'] },
    status: { type: String, enum: ['missed', 'rejected', 'accepted', 'ended'] },
    duration: Number, // in seconds
  },
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String,
  }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

messageSchema.index({ match: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
