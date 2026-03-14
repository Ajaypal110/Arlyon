import React from 'react';
import { motion } from 'framer-motion';
import { Scale, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-dark-950 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
            <Scale className="w-4 h-4" />
            Terms of Use
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-dark-400 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <div className="grid gap-12 text-dark-300 leading-relaxed">
          <section className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-secondary" />
              1. Acceptance of Terms
            </h2>
            <p className="text-dark-400">
              By accessing or using Arlyon, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not use our services. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of those changes.
            </p>
          </section>

          <section className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-primary" />
              2. User Conduct & Responsibilities
            </h2>
            <div className="space-y-4">
              <p>
                To maintain a safe and respectful community, all users must adhere to the following rules:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-400">
                <li>You must be at least 18 years old to use Arlyon.</li>
                <li>You are responsible for maintaining the confidentiality of your account.</li>
                <li>Hate speech, harassment, and illegal activities are strictly prohibited.</li>
                <li>Impersonation or providing false information is a violation of our terms.</li>
              </ul>
            </div>
          </section>

          <section className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-accent" />
              3. Limitation of Liability
            </h2>
            <p className="text-dark-400">
              Arlyon provides a platform for connecting people but is not responsible for the conduct of users or the results of any interactions. We are not liable for any direct, indirect, or incidental damages resulting from your use of the platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
