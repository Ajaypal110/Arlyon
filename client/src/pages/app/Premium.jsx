import { motion } from 'framer-motion';
import { Crown, Check, Zap, Eye, Heart, Star, Shield, Sparkles, Loader2, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Free',
    price: '0',
    displayPrice: '0',
    type: 'free',
    duration: 'forever',
    color: 'from-dark-800 to-dark-700',
    icon: UserIcon,
    features: ['10 likes/day', '1 super like/day', 'Basic filters', 'Standard chat'],
    buttonText: 'Get Started'
  },
  { 
    name: 'Gold', 
    price: '9', 
    displayPrice: '999',
    type: 'gold',
    duration: 'month',
    color: 'from-amber-500 to-orange-500', 
    icon: Crown, 
    popular: true, 
    features: ['Unlimited likes', 'See who liked you', '5 super likes/day', 'Advanced filters', 'Read receipts', 'Profile boost'],
    buttonText: 'Go Gold'
  },
  { 
    name: 'Platinum', 
    price: '19', 
    displayPrice: '1,999',
    type: 'platinum',
    duration: 'month',
    color: 'from-primary to-secondary', 
    icon: Star, 
    features: ['Everything in Gold', '10 super likes/day', 'Priority matching', '5 monthly boosts', 'AI date assistant', 'Incognito mode'],
    buttonText: 'Go Platinum'
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
    if (planType === 'free') return;
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
        image: 'https://cdn-icons-png.flaticon.com/512/752/752763.png',
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            await api.post('/subscriptions/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            toast.success(`You are now a ${planType.toUpperCase()} member! 🎉`, { duration: 5000 });
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
          color: '#EC4899'
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
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Choose Your <span className="gradient-text">Plan</span></h1>
        <p className="text-dark-400 max-w-lg mx-auto text-lg italic">"Premium features for a premium experience."</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {plans.map((p, i) => (
          <motion.div 
            key={p.name} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className={`flex flex-col rounded-3xl p-6 md:p-8 bg-dark-800/40 backdrop-blur-md border transition-all duration-300 relative group
              ${p.popular ? 'border-primary/50 shadow-2xl shadow-primary/10 scale-105 z-10' : 'border-white/5 hover:border-white/10'}`}
          >
            {p.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-primary px-6 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">{p.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold">₹{p.displayPrice}</span>
                <span className="text-dark-500 font-medium">/{p.duration}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm md:text-base text-dark-200">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleUpgrade(p.type)}
              disabled={loadingPlan === p.type || p.type === 'free' || (user?.isPremium && user?.premiumTier === p.type)}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.98]
                ${p.type === 'free' ? 'btn-secondary opacity-50 cursor-default' : 
                  p.name === 'Gold' ? 'bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#ec4899] text-white hover:brightness-110 shadow-xl shadow-pink-500/20' : 
                  'btn-secondary border-white/10 hover:bg-white/5 text-white'}`}
            >
              {loadingPlan === p.type ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {p.type === 'free' ? 'Standard Access' : 
               user?.isPremium && user?.premiumTier === p.type ? 'Active Plan' : 
               p.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
