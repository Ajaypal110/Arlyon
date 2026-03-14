import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Mail className="w-4 h-4" />
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            Have a question or need assistance? Our team is here to help you make the most of your Arlyon experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            <div className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-xl font-display font-semibold text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Email Us</h4>
                    <p className="text-dark-400">support@arlyon.com</p>
                    <p className="text-dark-500 text-sm mt-1">Response within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Live Chat</h4>
                    <p className="text-dark-400">Available in-app for Premium users</p>
                    <p className="text-dark-500 text-sm mt-1">24/7 Priority Support</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Headquarters</h4>
                    <p className="text-dark-400">Silicon Valley, California</p>
                    <p className="text-dark-500 text-sm mt-1">Inspiration Drive, Suite 101</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {submitted ? (
              <div className="bg-dark-900/50 border border-white/5 rounded-3xl p-12 backdrop-blur-sm text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">Message Received!</h3>
                <p className="text-dark-400">Thank you for reaching out. A member of our team will contact you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-primary hover:text-primary-400 transition-colors text-sm font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-dark-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-dark-300 font-medium ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/5 text-white placeholder:text-dark-600 focus:border-primary/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-dark-300 font-medium ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/5 text-white placeholder:text-dark-600 focus:border-primary/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-dark-300 font-medium ml-1">Subject</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/5 text-white outline-none focus:border-primary/50 transition-all cursor-pointer">
                    <option className="bg-dark-900">General Inquiry</option>
                    <option className="bg-dark-900">Premium Subscription</option>
                    <option className="bg-dark-900">Account Issues</option>
                    <option className="bg-dark-900">Feedback</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-dark-300 font-medium ml-1">Message</label>
                  <textarea 
                    required
                    rows="4"
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/5 text-white placeholder:text-dark-600 focus:border-primary/50 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
