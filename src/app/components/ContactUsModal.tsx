import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Send, CheckCircle2, MessageSquare } from 'lucide-react';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
    }, 500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F0F3D]/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl max-h-[88vh] bg-white border border-blue-100 shadow-2xl rounded-3xl overflow-hidden z-10 flex flex-col text-[#1A1A2E]"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {/* Header */}
          <div className="relative p-6 sm:p-7 bg-gradient-to-r from-[#3B5BF6] via-[#7C3AED] to-[#F97316] text-white shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Mail className="w-3.5 h-3.5" /> Get In Touch
            </div>
            <h2 className="text-xl sm:text-3xl font-black">Contact Duneli & IUXOA</h2>
            <p className="text-white/85 text-xs sm:text-sm mt-0.5">Have feedback, partnership ideas, or technical questions?</p>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
            {submitted ? (
              <div className="p-6 text-center space-y-2.5 bg-green-50 border border-green-200 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                <h3 className="text-base font-black text-green-900">Message Delivered!</h3>
                <p className="text-xs text-green-800">
                  Thank you for reaching out. The Duneli / IUXOA team will respond to your email within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 px-5 py-2 rounded-full bg-green-600 text-white text-xs font-extrabold hover:bg-green-700 transition-all cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#1A1A2E] mb-1 uppercase tracking-wider">Your Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Anonymous Thinker"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#3B5BF6] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#1A1A2E] mb-1 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#3B5BF6] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#1A1A2E] mb-1 uppercase tracking-wider">Your Message *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us what's on your mind..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-[#1A1A2E] outline-none focus:border-[#3B5BF6] focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100/90 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#1A1A2E]/80">
                    <Mail className="w-4 h-4 text-[#3B5BF6]" />
                    <span className="font-semibold">Direct Email:</span>
                    <a
                      href="mailto:Iuxoa.officail@gmail.com"
                      className="font-extrabold text-[#3B5BF6] hover:underline select-all"
                    >
                      Iuxoa.officail@gmail.com
                    </a>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Official</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#1A1A2E]/60">
                    <MessageSquare className="w-3.5 h-3.5 text-[#3B5BF6]" />
                    <span>Direct response within 24h</span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    <span>Submit Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-[#1A1A2E]/60 font-semibold">
              Duneli & IUXOA Support • <a href="mailto:Iuxoa.officail@gmail.com" className="text-[#3B5BF6] font-bold hover:underline">Iuxoa.officail@gmail.com</a>
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#1A1A2E] text-white text-xs font-extrabold hover:bg-[#2d2d4e] transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
