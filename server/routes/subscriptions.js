import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const PLANS = {
  gold: { 
    id: 'gold_monthly',
    price: 999, 
    type: 'gold', 
    name: 'Gold',
    features: ['Unlimited likes', 'See who liked you', '5 super likes/day', 'Advanced filters', 'Read receipts', 'Profile boost']
  },
  platinum: { 
    id: 'platinum_monthly',
    price: 1999, 
    type: 'platinum',
    name: 'Platinum',
    features: ['Everything in Gold', '10 super likes/day', 'Priority matching', '5 monthly boosts', 'AI date assistant', 'Incognito mode']
  },
};

// GET /api/subscriptions/plans
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// POST /api/subscriptions/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { planType } = req.body;
    console.log('Initiating order for plan:', planType);
    
    // Normalize and check
    const normalizedType = planType?.toString().toLowerCase().trim();
    const plan = PLANS[normalizedType];
    
    if (!plan) {
      console.warn('Subscription Error: Invalid plan type received:', planType);
      return res.status(400).json({ success: false, message: `Invalid plan type: ${planType}` });
    }

    const options = {
      amount: plan.price * 100, // amount in paisa
      currency: "INR",
      receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`
    };

    const razorpay = new Razorpay({
      key_id: (process.env.RAZORPAY_KEY_ID || '').trim(),
      key_secret: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
    });

    const order = await razorpay.orders.create(options);
    
    // Create a pending subscription record
    await Subscription.create({
      user: req.user._id,
      planId: plan.id,
      planType: plan.type,
      razorpayOrderId: order.id,
      amount: plan.price,
      status: 'pending'
    });

    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    // Send back the specific Razorpay SDK error detail if it exists, otherwise the generic message
    res.status(500).json({ 
      success: false, 
      message: error.error ? error.error.description : error.message,
      detail: 'Make sure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in Render Environment Variables'
    });
  }
});

// POST /api/subscriptions/verify-payment
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', (process.env.RAZORPAY_KEY_SECRET || '').trim())
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update Subscription
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const subscription = await Subscription.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'active',
        startDate: new Date(),
        expiryDate: expiryDate
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription record not found' });
    }

    // Update User
    await User.findByIdAndUpdate(req.user._id, { 
      isPremium: true, 
      premiumTier: subscription.planType,
      premiumExpiry: expiryDate,
      lastSubscription: subscription._id
    });

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/subscriptions/my
router.get('/my', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
