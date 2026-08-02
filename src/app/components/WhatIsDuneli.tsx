import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Volume2, Sparkles, Sliders, CheckCircle2, XCircle, EyeOff, MessageSquareHeart, Frown, Smile, Heart, Zap, Sparkle, ArrowRight, Shield, Mic, Lock, Compass } from 'lucide-react';
import { Theme } from '../types';

interface WhatIsDuneliProps {
  currentTheme: Theme;
}

const pillars = [
  {
    id: 'sanctuary',
    title: 'An Audio Sanctuary for Introverts',
    badge: 'Core Purpose',
    icon: Volume2,
    gradient: 'from-[#3B5BF6] to-[#7C3AED]',
    accentColor: '#3B5BF6',
    headline: 'Talk when you want, listen silently when you do not.',
    description: 'Traditional social media requires constant performance—cameras, profile pictures, and quick hot takes. Duneli is designed specifically for introverts and deep thinkers who crave meaningful conversations without social exhaustion.',
    metrics: [
      { label: 'Camera Requirement', value: '0%' },
      { label: 'Social Anxiety', value: 'Zero' },
      { label: 'Listening Comfort', value: '100%' },
    ],
  },
  {
    id: 'meritocracy',
    title: 'Meritocracy of Pure Ideas',
    badge: 'Philosophy',
    icon: Sparkles,
    gradient: 'from-[#7C3AED] to-[#ec4899]',
    accentColor: '#7C3AED',
    headline: 'Ideas compete, not clout or follower counts.',
    description: 'On Duneli, nobody knows how many followers you have, what you look like, or where you work. The weight of your words is measured purely by the wisdom and logic of your thoughts.',
    metrics: [
      { label: 'Follower Bias', value: '0%' },
      { label: 'Thought Depth', value: 'Maximum' },
      { label: 'Equal Opportunity', value: '100%' },
    ],
  },
  {
    id: 'anonymity',
    title: 'Unconditional Anonymity',
    badge: 'Privacy Guarantee',
    icon: ShieldCheck,
    gradient: 'from-[#F97316] to-[#ef4444]',
    accentColor: '#F97316',
    headline: 'Say what you truly believe without real-world stigma.',
    description: 'Identity leaks lead to self-censorship. Duneli protects your voice with robust end-to-end anonymity so you can discuss sensitive, complex, or taboo topics with complete peace of mind.',
    metrics: [
      { label: 'Real Name Required', value: 'No' },
      { label: 'Identity Encryption', value: '100%' },
      { label: 'Peace of Mind', value: 'Absolute' },
    ],
  },
  {
    id: 'connection',
    title: 'Deep, Low-Pressure Connection',
    badge: 'Community',
    icon: MessageSquareHeart,
    gradient: 'from-[#10b981] to-[#3B5BF6]',
    accentColor: '#10b981',
    headline: 'Build genuine bonds with like-minded minds.',
    description: 'Connect with fellow introverts, philosophers, and curious thinkers globally. Enter or leave any room silently at any moment—no awkward goodbyes or obligatory stay.',
    metrics: [
      { label: 'Awkward Goodbyes', value: '0%' },
      { label: 'Mindset Match', value: 'High' },
      { label: 'Exit Freedom', value: 'Instant' },
    ],
  },
];

const interactiveFeatures = [
  {
    id: 'profile',
    title: 'Profile & Identity',
    icon: '👤',
    loudMedia: {
      headline: 'Identity Pressure 😫',
      desc: 'Requires photos, detailed bios, follower counts, and status symbols. Everything is judged by appearance.',
      badge: 'Stress Level: High 💥',
      tag: 'Loud & Judgmental',
    },
    duneliWay: {
      headline: '100% Anonymous 🕊️✨',
      desc: 'Zero photos, zero bio requirements. You jump into rooms with total privacy—no profile judgement ever.',
      badge: 'Peace Level: 100% 💖',
      tag: 'Safe & Private',
    },
  },
  {
    id: 'speaking',
    title: 'Speaking Pressure',
    icon: '🎙️',
    loudMedia: {
      headline: 'Camera & Talk Anxiety 📷💥',
      desc: 'Forced camera streams, constant post notifications, and pressure to talk immediately or feel left out.',
      badge: 'Exhaustion: 99% 📉',
      tag: 'Forced Performance',
    },
    duneliWay: {
      headline: 'Listen Silently 🎧🥰',
      desc: 'Sit back and listen with 0% expectation to speak. Unmute your mic only when you feel genuinely inspired.',
      badge: 'Comfort: Maximum 🌈',
      tag: 'Zero Pressure',
    },
  },
  {
    id: 'ideas',
    title: 'How Ideas Win',
    icon: '💡',
    loudMedia: {
      headline: 'Clout & Popularity 📈',
      desc: 'The loudest voices, clickbait titles, and follower-heavy accounts win the algorithm regardless of value.',
      badge: 'Bias: High ❌',
      tag: 'Influencer Driven',
    },
    duneliWay: {
      headline: 'Pure Merit of Thought 🧠✨',
      desc: 'Ideas compete, not people. Respectful, logical, and thoughtful thoughts take center stage on equal ground.',
      badge: 'Fairness: 100% ⚖️',
      tag: 'Idea First',
    },
  },
  {
    id: 'exit',
    title: 'Leaving Rooms',
    icon: '🚪',
    loudMedia: {
      headline: 'Awkward Goodbyes 😅',
      desc: 'Socially uncomfortable exits, awkward explanations, or obligation to stay in boring video calls.',
      badge: 'Awkwardness: 100% 🛑',
      tag: 'Social Friction',
    },
    duneliWay: {
      headline: '1-Tap Ghost Exit 👻💜',
      desc: 'Leave any live audio room at any second with zero awkward goodbyes or explanation. Freedom guaranteed.',
      badge: 'Friction: Zero ✨',
      tag: 'Instant Freedom',
    },
  },
];

export function WhatIsDuneli({ currentTheme }: WhatIsDuneliProps) {
  const [activePillarId, setActivePillarId] = useState(pillars[0].id);
  const [activeTab, setActiveTab] = useState<'pillars' | 'comparison'>('pillars');
  const [activeFeatureId, setActiveFeatureId] = useState(interactiveFeatures[0].id);

  const activePillar = pillars.find((p) => p.id === activePillarId) || pillars[0];
  const activeFeature = interactiveFeatures.find((f) => f.id === activeFeatureId) || interactiveFeatures[0];

  return (
    <section className="py-24 px-4 sm:px-8 relative overflow-hidden my-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full blur-[170px] opacity-20 pointer-events-none z-0 bg-gradient-to-r from-[#3B5BF6] via-[#7C3AED] to-[#ec4899]" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-sm text-xs font-black text-[#7C3AED] mb-4"
          >
            <EyeOff className="w-4 h-4 text-[#7C3AED]" />
            <span>Discover Duneli</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-6xl font-black text-[#1A1A2E] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            What is <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B5BF6] via-[#7C3AED] to-[#F97316]">DUNELI?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base sm:text-xl text-[#1A1A2E]/75 leading-relaxed"
          >
            Duneli is an anonymous, camera-free social audio sanctuary crafted specifically for introverts & deep thinkers.
          </motion.p>

          {/* Interactive Navigation Mode Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-md">
            <button
              onClick={() => setActiveTab('pillars')}
              className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'pillars'
                  ? 'bg-[#1A1A2E] text-white shadow-md'
                  : 'text-[#1A1A2E]/70 hover:text-[#1A1A2E]'
              }`}
            >
              Core Pillars & Philosophy
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'comparison'
                  ? 'bg-[#1A1A2E] text-white shadow-md'
                  : 'text-[#1A1A2E]/70 hover:text-[#1A1A2E]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Duneli vs Loud Social Media 💖</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE PILLARS EXPLORER */}
        {activeTab === 'pillars' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Interactive Pillar Selector Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {pillars.map((pillar) => {
                const isActive = pillar.id === activePillarId;
                const Icon = pillar.icon;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => setActivePillarId(pillar.id)}
                    className={`group text-left p-5 rounded-3xl transition-all duration-300 border cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-white border-white shadow-2xl scale-[1.02] z-10'
                        : 'bg-white/50 hover:bg-white/80 border-white/60 text-[#1A1A2E]/75 hover:text-[#1A1A2E]'
                    }`}
                  >
                    {isActive && (
                      <div
                        className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-3xl"
                        style={{ background: pillar.accentColor }}
                      />
                    )}

                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-transform duration-300 ${
                          isActive
                            ? `bg-gradient-to-br ${pillar.gradient} shadow-lg scale-105`
                            : 'bg-[#1A1A2E]/5 text-[#1A1A2E]/70 group-hover:bg-[#1A1A2E]/10'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1A1A2E]/50">
                          {pillar.badge}
                        </span>
                        <h3 className={`text-base font-extrabold truncate ${isActive ? 'text-[#1A1A2E]' : 'text-[#1A1A2E]/80'}`}>
                          {pillar.title}
                        </h3>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Dynamic Interactive Showcase Card */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePillar.id}
                  initial={{ opacity: 0, x: 25, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -25, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="bg-white/85 backdrop-blur-2xl border border-white/90 shadow-2xl rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[440px]"
                >
                  <div
                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[90px] pointer-events-none opacity-30"
                    style={{ background: activePillar.accentColor }}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-3.5 py-1.5 rounded-full bg-[#1A1A2E]/5 border border-[#1A1A2E]/10 text-xs font-black text-[#1A1A2E] shadow-sm">
                        {activePillar.badge}
                      </span>

                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activePillar.gradient} flex items-center justify-center text-white shadow-xl`}
                      >
                        <activePillar.icon className="w-7 h-7" />
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] mb-3 leading-snug">
                      {activePillar.headline}
                    </h3>

                    <p className="text-sm sm:text-base text-[#1A1A2E]/80 font-medium leading-relaxed mb-8">
                      {activePillar.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#1A1A2E]/10 grid grid-cols-3 gap-4">
                    {activePillar.metrics.map((m, idx) => (
                      <div key={idx} className="bg-slate-50/80 rounded-2xl p-3 sm:p-4 text-center border border-slate-100 shadow-sm">
                        <div className="text-lg sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED]">
                          {m.value}
                        </div>
                        <div className="text-[10px] sm:text-xs font-bold text-[#1A1A2E]/60 mt-1">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        )}

        {/* TAB 2: ADORABLE UNIQUE INTERACTIVE COMPARISON STAGE */}
        {activeTab === 'comparison' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-8"
          >
            {/* Interactive Feature Pills */}
            <div className="flex items-center justify-center flex-wrap gap-3">
              {interactiveFeatures.map((feat) => {
                const isActive = feat.id === activeFeatureId;
                return (
                  <button
                    key={feat.id}
                    onClick={() => setActiveFeatureId(feat.id)}
                    className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white shadow-xl scale-105'
                        : 'bg-white/80 hover:bg-white text-[#1A1A2E]/70 hover:text-[#1A1A2E] border border-white/80 shadow-sm'
                    }`}
                  >
                    <span>{feat.icon}</span>
                    <span>{feat.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Adorable Dual Card Comparison Duel Arena */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch relative">
              
              {/* Center VS Heart Badge */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-2xl items-center justify-center z-20 font-black text-xs text-[#7C3AED]">
                <Heart className="w-5 h-5 fill-pink-500 text-pink-500 animate-pulse" />
              </div>

              {/* CARD 1: LOUD TRADITIONAL SOCIAL MEDIA (Sad/Stressed Aesthetic) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`loud-${activeFeature.id}`}
                  initial={{ opacity: 0, x: -20, rotate: -1 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-rose-50/70 backdrop-blur-2xl border border-rose-200/80 shadow-xl rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] transition-transform"
                >
                  {/* Decorative background glow */}
                  <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-rose-300/30 blur-3xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-3.5 py-1 rounded-full bg-rose-200/60 text-rose-800 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Frown className="w-3.5 h-3.5 text-rose-600" />
                        <span>{activeFeature.loudMedia.tag}</span>
                      </span>

                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold border border-rose-200">
                        {activeFeature.loudMedia.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-rose-950 mb-3 flex items-center gap-2">
                      <span>{activeFeature.loudMedia.headline}</span>
                    </h3>

                    <p className="text-sm text-rose-900/80 font-medium leading-relaxed mb-6">
                      {activeFeature.loudMedia.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-rose-200/60 flex items-center justify-between text-xs font-extrabold text-rose-700">
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Traditional Social Platforms</span>
                    </span>
                    <span className="text-rose-400 font-bold">Stressed</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* CARD 2: THE DUNELI SANCTUARY (Adorable Happy Serene Aesthetic) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`duneli-${activeFeature.id}`}
                  initial={{ opacity: 0, x: 20, rotate: 1 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-emerald-50/80 backdrop-blur-2xl border-2 border-emerald-300/80 shadow-2xl shadow-emerald-500/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] transition-transform"
                >
                  {/* Decorative glowing background spot */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-300/40 blur-3xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-3.5 py-1 rounded-full bg-emerald-200/80 text-emerald-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <Smile className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{activeFeature.duneliWay.tag}</span>
                      </span>

                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>{activeFeature.duneliWay.badge}</span>
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-emerald-950 mb-3 flex items-center gap-2">
                      <span>{activeFeature.duneliWay.headline}</span>
                    </h3>

                    <p className="text-sm text-emerald-900/90 font-semibold leading-relaxed mb-6">
                      {activeFeature.duneliWay.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-emerald-200 flex items-center justify-between text-xs font-extrabold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>The Duneli Sanctuary 🎙️</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 text-[10px] font-black">
                      Peaceful 💖
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>

            {/* Bottom Summary Pill */}
            <div className="text-center pt-2">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 border border-slate-200 shadow-sm text-xs font-extrabold text-[#1A1A2E]/70">
                <Sparkles className="w-4 h-4 text-[#F97316]" />
                <span>Tap any feature pill above to explore differences in real-time</span>
              </span>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
