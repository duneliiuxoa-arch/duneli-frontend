import { ArrowLeft, Shield, Headphones, Users, Lightbulb, CheckCircle2, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Theme } from '../types';

export interface FeatureData {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  iconName: 'shield' | 'headphones' | 'users' | 'lightbulb';
  overview: string;
  highlights: string[];
  deepDive: string;
  faq: { q: string; a: string }[];
}

export const featureDetailsData: Record<string, FeatureData> = {
  '100% Anonymous': {
    id: 'anonymous',
    title: '100% Anonymous Audio Spaces',
    badge: 'Privacy & Freedom',
    subtitle: 'Speak freely without social anxiety, real names, or profile judgment.',
    gradientFrom: '#3B5BF6',
    gradientTo: '#7C3AED',
    iconName: 'shield',
    overview: 'Duneli is engineered from the ground up as a zero-exposure audio space. In a world dominated by public profiles and follower metrics, Duneli gives you absolute freedom to share thoughts without identity anxiety.',
    highlights: [
      'No profile photos, bios, or real name verification required',
      'Ephemeral session tokens ensure your room activity isn’t linked to a public history',
      'End-to-end privacy protections keeping your personal data completely separate',
      'Safe environment for introverts to share non-conforming, high-value ideas',
    ],
    deepDive: 'Traditional social platforms link every word to your public profile, leading to self-censorship and social hesitation. Duneli decouples identity from voice. You are judged solely on the clarity and value of your ideas, creating an authentic sanctuary for deep dialogues.',
    faq: [
      { q: 'Can other users trace my real identity?', a: 'No. Users inside audio rooms only see anonymous temporary session identifiers like "Speaker #1" or "Listener #4".' },
      { q: 'Is registration required to listen?', a: 'No! You can browse and listen to any live audio discussion completely anonymously without logging in.' },
    ],
  },
  'Zero Pressure': {
    id: 'zero-pressure',
    title: 'Zero Pressure Listening',
    badge: 'Peace of Mind',
    subtitle: 'Listen silently with 0% expectation to speak. Turn on your mic only when ready.',
    gradientFrom: '#7C3AED',
    gradientTo: '#a855f7',
    iconName: 'headphones',
    overview: 'Introverts thrive when they control their level of participation. On Duneli, you are never put on the spot, forced to speak, or called out unexpectedly.',
    highlights: [
      'Default Spectator Mode allows passive background listening with zero mic pressure',
      'One-tap hand-raise button when you feel inspired to contribute to the discussion',
      'No camera requirements—100% audio-only environment built for cognitive ease',
      'Freedom to leave any room at any moment with zero awkward goodbyes',
    ],
    deepDive: 'Most video and audio apps create performance pressure. Duneli reimagines digital audio rooms as welcoming fireside chats where silent listening is respected as much as active speaking. Take your time, absorb the conversation, and speak only when you feel ready.',
    faq: [
      { q: 'Will the host know if I am just listening?', a: 'Hosts see room listener counts, but you are never forced to speak or turn on your microphone.' },
      { q: 'How do I speak if I want to contribute?', a: 'Simply tap the "Raise Hand" button. The host will invite you to the stage when a speaker slot opens.' },
    ],
  },
  '10K+ Deep Thinkers': {
    id: 'deep-thinkers',
    title: '10K+ Deep Thinkers Community',
    badge: 'Thoughtful Community',
    subtitle: 'Join live, thoughtful audio rooms hosted daily by like-minded introverts.',
    gradientFrom: '#F97316',
    gradientTo: '#ef4444',
    iconName: 'users',
    overview: 'Connect with a global community of over 10,000 introverts, researchers, debaters, and deep thinkers passionate about meaningful dialogue.',
    highlights: [
      'Daily scheduled rooms spanning philosophy, technology, ethics, and psychology',
      'Strict community moderation enforcing respectful, constructive debate rules',
      'Global community operating 24/7 across multiple languages and interest categories',
      'Room interest matching ensuring you always find topics that resonate with you',
    ],
    deepDive: 'Duneli brings together people who prefer depth over small talk. Whether you want to explore the future of AI, workplace psychology, or philosophical ethics, you will find a thoughtful audience ready for genuine intellectual exchange.',
    faq: [
      { q: 'How are discussions moderated?', a: 'Rooms follow strict civility guidelines. Automated and community moderators ensure respectful dialogue without personal attacks.' },
      { q: 'Can I schedule my own discussion topic?', a: 'Yes! Anyone can schedule a topic using our instant search & schedule workflow.' },
    ],
  },
  'Ideas Over Clout': {
    id: 'ideas-over-clout',
    title: 'Ideas Over Clout',
    badge: 'Meritocratic Stage',
    subtitle: 'Judgement-free space where logic and thought triumph over popularity.',
    gradientFrom: '#10b981',
    gradientTo: '#3B5BF6',
    iconName: 'lightbulb',
    overview: 'On Duneli, popularity metrics are eliminated. Content quality, reasoning, and mutual respect are the only currencies that matter.',
    highlights: [
      'Zero follower counts, clout badges, or social hierarchy indicators',
      'Equal speaking time allocations managed by automated room timers',
      'Peer-voted key takeaways synthesized into published Dunora articles',
      'Open-minded environment prioritizing logical arguments over loudness',
    ],
    deepDive: 'Most platforms reward noise, outrage, and follower counts. Duneli flips the script by creating a merit-based audio stage. Here, a first-time participant’s well-reasoned point carries equal weight as anyone else in the room.',
    faq: [
      { q: 'How are speaking turns managed?', a: 'Each speaker gets dedicated time blocks with clear visual timers to ensure fair airtime for everyone.' },
      { q: 'Where do key room insights go after a session ends?', a: 'Key takeaways are peer-verified and published on Dunora, our open synthesis publication.' },
    ],
  },
};

interface FeatureDetailPageProps {
  featureTitle: string;
  currentTheme: Theme;
  onBack: () => void;
  onOpenShutter?: () => void;
}

export function FeatureDetailPage({ featureTitle, onBack, onOpenShutter }: FeatureDetailPageProps) {
  const feature = featureDetailsData[featureTitle] || featureDetailsData['100% Anonymous'];

  const getIcon = () => {
    switch (feature.iconName) {
      case 'shield':
        return Shield;
      case 'headphones':
        return Headphones;
      case 'users':
        return Users;
      case 'lightbulb':
        return Lightbulb;
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
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
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Feature Details</span>
          <button
            onClick={() => {
              if (onOpenShutter) onOpenShutter();
              window.dispatchEvent(new Event('open-shutter-drawer'));
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <span>Explore Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Banner Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative rounded-3xl p-8 sm:p-12 overflow-hidden shadow-xl text-white border border-white/20"
          style={{ background: `linear-gradient(135deg, ${feature.gradientFrom}, ${feature.gradientTo})` }}
        >
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider mb-4 border border-white/30">
              {feature.badge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              {feature.title}
            </h1>
            <p className="text-base sm:text-lg text-white/90 font-semibold leading-relaxed">
              {feature.subtitle}
            </p>
          </div>

          <div className="absolute -bottom-10 -right-10 opacity-15 pointer-events-none">
            <IconComponent className="w-80 h-80 text-white" />
          </div>
        </motion.div>

        {/* Overview & Key Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${feature.gradientFrom}, ${feature.gradientTo})` }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1A1A2E]">Overview</h2>
              <p className="text-xs text-slate-400 font-semibold">What makes this core to Duneli</p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            {feature.overview}
          </p>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#7C3AED] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Key Pillars & Benefits</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {feature.highlights.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F4F6FB] border border-slate-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#3B5BF6] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-bold text-[#1A1A2E] leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Deep Dive Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-gradient-to-br from-blue-50/60 to-purple-50/60 rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm"
        >
          <h2 className="text-base font-black text-[#1A1A2E] mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#3B5BF6]" />
            <span>Why We Built This</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            {feature.deepDive}
          </p>
        </motion.div>

        {/* Frequently Asked Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
        >
          <h2 className="text-lg font-black text-[#1A1A2E] border-b border-slate-100 pb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {feature.faq.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#F4F6FB] border border-slate-200/80 space-y-2">
                <h4 className="text-sm font-extrabold text-[#1A1A2E]">{item.q}</h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4"
        >
          <h3 className="text-xl font-black text-[#1A1A2E]">Ready to experience {feature.title}?</h3>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
            Join thousands of introverts in live audio discussions right now. Zero pressure, no camera required.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => {
                if (onOpenShutter) onOpenShutter();
                window.dispatchEvent(new Event('open-shutter-drawer'));
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white text-sm font-extrabold shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Join Live Audio Rooms</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </motion.div>

        <div className="h-8" />
      </div>
    </div>
  );
}
