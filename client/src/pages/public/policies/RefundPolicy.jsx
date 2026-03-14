import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, RefreshCw, XCircle, HelpingHand } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-dark-950 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            <RefreshCw className="w-4 h-4" />
            Billing & Refunds
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Refund Policy
          </h1>
          <p className="text-dark-400 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <div className="grid gap-12 text-dark-300 leading-relaxed">
          <section className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-accent" />
              1. Subscription Purchases
            </h2>
            <p className="text-dark-400">
              Arlyon Premium subscriptions are generally non-refundable. When you purchase a subscription, you gain immediate access to exclusive features. However, we may consider refund requests on a case-by-case basis under special circumstances, such as technical errors or accidental multiple charges.
            </p>
          </section>

          <section className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-primary" />
              2. Cancellation
            </h2>
            <p className="text-dark-400">
              You can cancel your subscription at any time through your account settings. Upon cancellation, you will continue to have access to premium features until the end of your current billing period. No further charges will be made, but partial month refunds are not provided.
            </p>
          </section>

          <section className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-3">
              <HelpingHand className="w-6 h-6 text-secondary" />
              3. Support & Dispute Resolution
            </h2>
            <p className="text-dark-400">
              If you believe you are entitled to a refund due to a technical failure or billing discrepancy, please contact our support team within 14 days of the transaction. We aim to review and respond to all billing inquiries within 3-5 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
