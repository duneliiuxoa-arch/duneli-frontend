import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, ChevronDown } from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FaqModal({ isOpen, onClose }: FaqModalProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Is Duneli completely free to use?',
      a: 'Yes! Duneli is 100% free for listeners, speakers, and debaters. You can create public or private rooms without subscription fees.',
    },
    {
      q: 'How does Duneli guarantee anonymity?',
      a: 'Duneli does not display real names, profile photos, or social media links. You are assigned randomized temporary handles in room sessions.',
    },
    {
      q: 'What is Dunora and how does it connect to Duneli?',
      a: 'Dunora (hosted at dunora.vercel.app) is Duneli’s asynchronous thought engine. While Duneli focuses on live real-time audio rooms, Dunora handles persistent, structured thought trees.',
    },
    {
      q: 'What is the difference between Listener, Speaker, and Debater roles?',
      a: 'Listeners have their mic locked OFF to enjoy zero-pressure listening. Speakers join an orderly queue to talk in turn. Debaters have open mic privileges for spontaneous dialogue.',
    },
    {
      q: 'Who creates and maintains Duneli?',
      a: 'Duneli is engineered and maintained by IUXOA, a tech studio crafting applications, websites, and games.',
    },
  ];

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
          <div className="relative p-6 sm:p-7 bg-gradient-to-r from-[#7C3AED] to-[#F97316] text-white shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-xl sm:text-3xl font-black">Duneli Knowledge Base</h2>
            <p className="text-white/85 text-xs sm:text-sm mt-0.5">Quick answers to everything you need to know about Duneli.</p>
          </div>

          {/* Accordion List */}
          <div className="p-5 sm:p-6 space-y-2.5 flex-1 overflow-y-auto">
            {faqs.map((faq, idx) => {
              const isExpanded = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isExpanded ? null : idx)}
                    className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-purple-50/50 transition-colors"
                  >
                    <span className="font-extrabold text-xs sm:text-sm text-[#1A1A2E]">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#7C3AED] transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4 pt-1 border-t border-slate-200/60 text-xs text-[#1A1A2E]/75 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-[#1A1A2E]/60 font-semibold">Duneli Support Desk</span>
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
