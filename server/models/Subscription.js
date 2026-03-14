import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: String, required: true }, // e.g., 'gold_monthly', 'platinum_monthly'
  planType: { type: String, enum: ['gold', 'platinum'], required: true },
  
  // Razorpay Specifics
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'failed', 'expired', 'cancelled'], 
    default: 'pending' 
  },
  
  startDate: { type: Date },
  expiryDate: { type: Date },
  
  // Metadata
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' }
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);
