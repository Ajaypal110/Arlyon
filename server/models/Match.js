import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  matchedAt: { type: Date, default: Date.now },
  compatibility: { type: Number, default: 0 },
  compatibilityBreakdown: {
    interests: { type: Number, default: 0 },
    lifestyle: { type: Number, default: 0 },
    personality: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
  },
  conversationHealth: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  unmatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  unmatchedAt: Date,
}, { timestamps: true });

matchSchema.index({ users: 1 });

export default mongoose.model('Match', matchSchema);
