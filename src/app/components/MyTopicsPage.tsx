import { ArrowLeft, TrendingUp, Plus, Calendar, Users, Globe, Mic, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Theme } from '../types';

interface MyTopicsPageProps {
  currentTheme: Theme;
  onBack: () => void;
  onOpenShutter: () => void;
}

export function MyTopicsPage({ onBack, onOpenShutter }: MyTopicsPageProps) {
  const myTopics = [
    { id: '1', title: 'The Economics of Open-Source Intelligence', category: 'Technology', status: 'Scheduled', time: 'Today at 7:00 PM', supporters: 42, language: 'English' },
    { id: '2', title: 'Philosophy of Digital Privacy in 2026', category: 'Politics', status: 'Live Now', supporters: 89, language: 'English' },
    { id: '3', title: 'Ancient Greek Dialectic vs Modern Social Debates', category: 'History', status: 'Completed', supporters: 124, language: 'English' },
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
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">My Topics</span>
          <button
            onClick={onOpenShutter}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Topic</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 bg-gradient-to-r from-[#7C3AED] to-[#ec4899] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase mb-3">Host Dashboard</span>
            <h1 className="text-3xl font-black mb-2">Topics Created By Me</h1>
            <p className="text-white/85 text-sm max-w-lg">Manage your scheduled audio rooms, view supporter counts, and initiate live discussions.</p>
          </div>
          <button
            onClick={onOpenShutter}
            className="px-6 py-3 rounded-2xl bg-white text-[#7C3AED] font-black text-sm hover:bg-slate-100 transition-all shadow-lg shrink-0 cursor-pointer"
          >
            + Create New Room
          </button>
        </motion.div>

        {/* Topics List */}
        <div className="space-y-4">
          {myTopics.map((topic, idx) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase text-white bg-[#7C3AED]">
                      {topic.category}
                    </span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                      topic.status === 'Live Now' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-[#3B5BF6]'
                    }`}>
                      {topic.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-[#1A1A2E]">{topic.title}</h2>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {topic.time}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#3B5BF6]" /> {topic.supporters} Supporters</span>
                    <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {topic.language}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onOpenShutter}
                    className="px-4 py-2 rounded-xl bg-[#1A1A2E] text-white text-xs font-extrabold hover:bg-[#2d2d4e] transition-all cursor-pointer"
                  >
                    View Room
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
