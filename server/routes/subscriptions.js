import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const PLANS = {
  basic: { price: 499, features: { unlimitedLikes: false, seeWhoLiked: false, profileBoost: 1, advancedFilters: true, priorityMatching: false, readReceipts: true, superLikesPerDay: 3 } },
  gold: { price: 999, features: { unlimitedLikes: true, seeWhoLiked: true, profileBoost: 3, advancedFilters: true, priorityMatching: true, readReceipts: true, superLikesPerDay: 5 } },
  platinum: { price: 1999, features: { unlimitedLikes: true, seeWhoLiked: true, profileBoost: 5, advancedFilters: true, priorityMatching: true, readReceipts: true, superLikesPerDay: 10 } },
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// GET /api/subscriptions/plans
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// POST /api/subscriptions/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });

    const options = {
      amount: PLANS[plan].price * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_${req.user._id}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/subscriptions/verify-payment
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Payment is verified, create subscription
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan,
      price: PLANS[plan].price,
      endDate,
      features: PLANS[plan].features,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    await User.findByIdAndUpdate(req.user._id, { isPremium: true, premiumExpiry: endDate });
    res.status(200).json({ success: true, subscription });
  } catch (error) {
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
