import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Shield, Zap, MessageCircle, Stars, ArrowRight, Check } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI-Powered Matching', desc: 'Our algorithm learns your preferences to find your perfect match.' },
  { icon: Shield, title: 'Verified Profiles', desc: 'Selfie verification and trust scores keep the community safe.' },
  { icon: MessageCircle, title: 'Smart Chat', desc: 'AI conversation starters and real-time messaging with read receipts.' },
  { icon: Zap, title: 'Instant Connections', desc: 'Get notified the moment you match with someone special.' },
  { icon: Heart, title: 'Compatibility Radar', desc: 'Visual compatibility breakdown across interests, lifestyle & personality.' },
  { icon: Stars, title: 'Vibe Matching', desc: 'Match based on mood, energy, and current vibe.' },
];

const plans = [
  { name: 'Free', price: '₹0', period: '/forever', features: ['10 likes/day', '1 super like/day', 'Basic filters', 'Standard chat'], cta: 'Get Started', popular: false },
  { name: 'Gold', price: '₹999', period: '/month', features: ['Unlimited likes', 'See who liked you', '5 super likes/day', 'Advanced filters', 'Read receipts', 'Profile boost'], cta: 'Go Gold', popular: true },
  { name: 'Platinum', price: '₹1,999', period: '/month', features: ['Everything in Gold', '10 super likes/day', 'Priority matching', '5 monthly boosts', 'AI date assistant', 'Incognito mode'], cta: 'Go Platinum', popular: false },
];

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">ARLYON</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-dark-400 hover:text-white text-sm font-medium transition-colors">Features</a>
            <a href="#pricing" className="text-dark-400 hover:text-white text-sm font-medium transition-colors">Pricing</a>
            <Link to="/login" className="btn-ghost text-sm">Log in</Link>
            <Link to="/signup" className="btn-primary text-sm !py-2.5 !px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-accent/15 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '4s' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div {...fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary-300" />
              <span className="text-sm text-primary-300 font-medium">AI-Powered Dating Platform</span>
            </div>
          </motion.div>

          <motion.h1 {...fadeInUp} transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            Where Meaningful{' '}
            <span className="gradient-text">Connections</span>{' '}
            Begin
          </motion.h1>

          <motion.p {...fadeInUp} transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-10 text-balance">
            ARLYON uses advanced AI to match you with people who truly complement your personality, interests, and life goals. Not just swipes — real connections.
          </motion.p>

          <motion.div {...fadeInUp} transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-base !py-3.5 !px-8 flex items-center gap-2">
              Start Matching <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-secondary text-base !py-3.5 !px-8">
              See How It Works
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeInUp} transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            {[['2M+', 'Active Users'], ['500K+', 'Matches Made'], ['4.9★', 'App Rating']].map(([stat, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold gradient-text">{stat}</div>
                <div className="text-sm text-dark-500">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Everything You Need to Find <span className="gradient-text">The One</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">Powered by cutting-edge AI and designed for authentic connections.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card-hover group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h2>
            <p className="text-dark-400 text-lg">Find love without breaking the bank.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`card-hover relative ${plan.popular ? 'border-primary/30 bg-primary/5' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className="text-dark-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-dark-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-3 rounded-xl font-medium transition-all duration-300 ${
                    plan.popular ? 'btn-primary w-full' : 'btn-secondary w-full'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div {...fadeInUp}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl" />
          <div className="absolute inset-0 glass" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Meet Your Match?
            </h2>
            <p className="text-dark-300 text-lg mb-8 max-w-xl mx-auto">
              Join 2 million+ singles who found meaningful connections on ARLYON.
            </p>
            <Link to="/signup" className="btn-primary text-base !py-3.5 !px-10 inline-flex items-center gap-2">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold gradient-text">ARLYON</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-dark-500">
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
          <p className="text-xs text-dark-600">© 2024 ARLYON. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
