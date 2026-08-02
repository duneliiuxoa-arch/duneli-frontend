import { ArrowLeft, TrendingUp, Users, Bell, Calendar, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Theme } from '../types';

interface SupportedTopicsPageProps {
  currentTheme: Theme;
  onBack: () => void;
  onOpenShutter: () => void;
}

export function SupportedTopicsPage({ onBack, onOpenShutter }: SupportedTopicsPageProps) {
  const supportedTopics = [
    { title: 'The Psychology of Solitude in Hyperconnected World', category: 'Environment', host: 'Elena Rostova', supporters: 142, scheduled: 'Today in 2 hours' },
    { title: 'Is Meritocracy Real? Logic vs Social Status', category: 'Politics', host: 'Marcus Vance', supporters: 210, scheduled: 'Tomorrow at 8:00 PM' },
    { title: 'De-centralized Audio Governance Protocols', category: 'Technology', host: 'Satoshi N.', supporters: 380, scheduled: 'Aug 2, 2026' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#1A1A2E] font-extrabold text-sm hover:text-[#3B5BF6] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Supported Topics</span>
          <button
            onClick={onOpenShutter}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white text-xs font-extrabold shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            Explore Rooms
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 bg-gradient-to-r from-[#F97316] to-[#ef4444] text-white shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Community Backing</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Topics I Have Supported</h1>
          <p className="text-white/85 text-sm max-w-lg">Discussions you have upvoted to help reach the live audio stage.</p>
        </motion.div>

        {/* List */}
        <div className="space-y-4">
          {supportedTopics.map((topic, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase text-white bg-[#F97316]">
                    {topic.category}
                  </span>
                  <span className="text-xs font-extrabold text-green-600 flex items-center gap-1 bg-green-50 px-2.5 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Supported
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-[#1A1A2E]">{topic.title}</h2>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                  <span>Host: <strong className="text-[#1A1A2E]">{topic.host}</strong></span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#F97316]" /> {topic.supporters} Supporters</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {topic.scheduled}</span>
                </div>
              </div>

              <button
                onClick={onOpenShutter}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-[#1A1A2E] hover:bg-[#3B5BF6] hover:text-white font-extrabold text-xs transition-all shrink-0 cursor-pointer"
              >
                View Room
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
