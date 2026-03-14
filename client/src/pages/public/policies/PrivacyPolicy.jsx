import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-dark-950 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Legal & Trust
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-dark-400 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <div className="grid gap-12 text-dark-300 leading-relaxed">
          <section className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <p>
                At Arlyon, we collect information that you provide directly to us when you create an account, update your profile, or communicate with other users. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-400">
                <li>Personal details (Name, Age, Gender, Interests)</li>
                <li>Contact information (Email address)</li>
                <li>Profile media (Photos and videos)</li>
                <li>Location data (to help you find matches nearby)</li>
              </ul>
            </div>
          </section>

          <section className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-secondary" />
              2. How We Use Your Data
            </h2>
            <div className="space-y-4">
              <p>
                We use the collected information to provide and improve our services, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-400">
                <li>Personalizing your matching experience.</li>
                <li>Facilitating communication between users.</li>
                <li>Ensuring the safety and security of our community.</li>
                <li>Analyzing platform usage to enhance user experience.</li>
              </ul>
            </div>
          </section>

          <section className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-accent" />
              3. Data Protection
            </h2>
            <p className="text-dark-400">
              We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or destruction. Your private conversations are encrypted and never shared with third parties for marketing purposes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
