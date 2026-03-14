import { motion } from 'framer-motion';
import { Crown, Check, Zap, Eye, Heart, Star, Shield, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const plans = [
  { 
    name: 'Gold', 
    price: '1', 
    type: 'gold',
    color: 'from-amber-500 to-orange-500', 
    icon: Crown, 
    popular: true, 
    features: ['Unlimited Likes', 'See Who Liked You', '5 Super Likes/day', 'Advanced Filters', 'Read Receipts', '3 Boosts/month', 'Priority Matching'] 
  },
  { 
    name: 'Platinum', 
    price: '2', 
    type: 'platinum',
    color: 'from-primary to-secondary', 
    icon: Star, 
    features: ['Everything in Gold', '10 Super Likes/day', '5 Boosts/month', 'AI Date Assistant', 'Incognito Mode', 'Priority Support', 'Profile Highlights'] 
  },
];

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Premium() {
  const { user, updateUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleUpgrade = async (planType) => {
    try {
      setLoadingPlan(planType);
      const res = await loadRazorpay();
      
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you offline?');
        return;
      }

      // Create order
      const { data: orderData } = await api.post('/subscriptions/create-order', {
        planType: planType
      });

      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'ARLYON Premium',
        description: `Upgrade to ${planType.toUpperCase()} Plan`,
        image: 'https://cdn-icons-png.flaticon.com/512/752/752763.png', // Premium Crown Icon
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            await api.post('/subscriptions/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            toast.success(`You are now a ${planType.toUpperCase()} member! 🎉`, { duration: 5000 });
            // Refresh user data to update isPremium flag
            if (updateUser) await updateUser();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#EC4899' // Secondary brand color
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment Initiation Error:', error);
      const data = error.response?.data;
      if (data) {
        toast.error(`Error: ${data.message}${data.detail ? ` - ${data.detail}` : ''}`, { duration: 6000 });
      } else {
        toast.error('Network Error: Failed to initiate payment');
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
          <Crown className="w-4 h-4 text-amber-400" /><span className="text-sm text-amber-400 font-medium">Upgrade to Premium</span>
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">Unlock Your Full <span className="gradient-text">Potential</span></h1>
        <p className="text-dark-400 max-w-lg mx-auto">Get more matches, more features, and find your person faster.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {plans.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`card-hover relative ${p.popular ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
            {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-bold text-white">POPULAR</div>}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}><p.icon className="w-6 h-6 text-white" /></div>
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <div className="flex items-baseline gap-1 my-3"><span className="text-3xl font-display font-bold">₹{p.price}</span><span className="text-dark-500 text-sm">/mo</span></div>
            <ul className="space-y-2.5 mb-6">
              {p.features.map(f => (<li key={f} className="flex items-center gap-2 text-sm text-dark-300"><Check className="w-4 h-4 text-green-400 flex-shrink-0" />{f}</li>))}
            </ul>
            <button 
              onClick={() => handleUpgrade(p.type)}
              disabled={loadingPlan === p.type || (user?.isPremium && user?.premiumTier === p.type)}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${p.popular ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25' : 'btn-secondary'}`}
            >
              {loadingPlan === p.type ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {user?.isPremium && user?.premiumTier === p.type ? 'Current Plan' : (user?.premiumTier === 'gold' && p.type === 'platinum' ? 'Upgrade to Platinum' : `Choose ${p.name}`)}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
