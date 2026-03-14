import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'superlike'], default: 'like' },
  isMatched: { type: Boolean, default: false },
}, { timestamps: true });

likeSchema.index({ from: 1, to: 1 }, { unique: true });
likeSchema.index({ to: 1, isMatched: 1 });

export default mongoose.model('Like', likeSchema);
