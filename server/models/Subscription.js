import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['basic', 'gold', 'platinum'], required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true },
  features: {
    unlimitedLikes: { type: Boolean, default: false },
    seeWhoLiked: { type: Boolean, default: false },
    profileBoost: { type: Number, default: 0 },
    advancedFilters: { type: Boolean, default: false },
    priorityMatching: { type: Boolean, default: false },
    readReceipts: { type: Boolean, default: false },
    superLikesPerDay: { type: Number, default: 1 },
  },
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);
