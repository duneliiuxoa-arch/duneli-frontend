import { ArrowLeft, Clock, Mic, Headphones, Sparkles, Calendar, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Theme } from '../types';

interface MyActivityPageProps {
  currentTheme: Theme;
  onBack: () => void;
  onOpenShutter: () => void;
}

export function MyActivityPage({ onBack, onOpenShutter }: MyActivityPageProps) {
  const stats = [
    { label: 'Hours Listened', value: '24.5 hrs', icon: Headphones, color: '#3B5BF6' },
    { label: 'Hand Raises', value: '12 times', icon: Mic, color: '#7C3AED' },
    { label: 'Rooms Participated', value: '18 rooms', icon: Calendar, color: '#F97316' },
    { label: 'Ideas Shared', value: '34 thoughts', icon: Sparkles, color: '#10b981' },
  ];

  const recentActivity = [
    { title: 'The Philosophy of Mind & AI Consciousness', role: 'Speaker', date: 'Today, 2:30 PM', duration: '45 mins', category: 'Technology' },
    { title: 'Remote Work Isolation & Authentic Connection', role: 'Listener', date: 'Yesterday, 8:00 PM', duration: '1 hr 10 mins', category: 'Environment' },
    { title: 'Stoicism in Modern Decision Making', role: 'Debater', date: 'Jul 28, 2026', duration: '50 mins', category: 'History' },
    { title: 'Geopolitics & Future Trade Boundaries', role: 'Listener', date: 'Jul 25, 2026', duration: '30 mins', category: 'Geography' },
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
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">My Activity</span>
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
          className="rounded-3xl p-8 bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-yellow-300" />
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Audio Passport</span>
          </div>
          <h1 className="text-3xl font-black mb-2">My Activity & Participation</h1>
          <p className="text-white/85 text-sm max-w-xl">Track your anonymous audio journey, rooms joined, hand-raise history, and thought contributions.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}1A` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <span className="text-2xl font-black text-[#1A1A2E]">{s.value}</span>
                <p className="text-xs font-bold text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-[#1A1A2E] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#3B5BF6]" />
              Recent Room Activity
            </h2>
            <span className="text-xs text-slate-400 font-bold">4 Sessions</span>
          </div>

          <div className="space-y-3">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-blue-50/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white bg-[#3B5BF6]">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1A1A2E]">{item.title}</h3>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-[#1A1A2E]">
                    Role: <strong className="text-[#3B5BF6]">{item.role}</strong>
                  </span>
                  <span>{item.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
