import { useState, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mic, Lightbulb, Users, ChevronRight, Rotate3d, Sparkles, Headphones, Scale, Lock, ArrowRight, ArrowLeft, Radio } from 'lucide-react';
import { Theme } from '../types';

interface HowDuneliWorks3DProps {
  currentTheme: Theme;
}

const steps = [
  {
    id: 1,
    number: '01',
    title: 'Pick a Topic & Stay Anonymous',
    badge: 'Step 1: Privacy First',
    icon: Shield,
    gradient: 'from-[#3B5BF6] to-[#7C3AED]',
    glowColor: 'rgba(59, 91, 246, 0.4)',
    shortDesc: 'Browse live rooms without profile exposure.',
    desc: 'Jump into any audio room instantly. No profile pictures, no real names, no follower counts. You choose your degree of anonymity.',
    features: ['No avatar required', 'Zero social media linking', 'Instant room entry'],
    threeDGraphic: {
      type: 'shield',
      label: '100% Anonymous Encryption',
      accentColor: '#3B5BF6',
    },
  },
  {
    id: 2,
    number: '02',
    title: 'Listen Silently or Speak Up',
    badge: 'Step 2: Zero Pressure',
    icon: Mic,
    gradient: 'from-[#7C3AED] to-[#ec4899]',
    glowColor: 'rgba(124, 58, 237, 0.4)',
    shortDesc: 'Listen passively or raise your hand when ready.',
    desc: 'No camera stress. Enjoy conversations as a silent listener with 0% expectation to speak, or tap the mic when you feel inspired.',
    features: ['Camera-free environment', '1-Tap hand raise', 'Silent spectator mode'],
    threeDGraphic: {
      type: 'mic',
      label: '3D Spatial Audio Node',
      accentColor: '#7C3AED',
    },
  },
  {
    id: 3,
    number: '03',
    title: 'Ideas Compete, Not People',
    badge: 'Step 3: Pure Dialogue',
    icon: Lightbulb,
    gradient: 'from-[#F97316] to-[#ef4444]',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    shortDesc: 'Thoughtful discussions over clout.',
    desc: 'Duneli replaces popularity contests with merit-based conversations. Logical, respectful, and open-minded thoughts take main stage.',
    features: ['Clout-free moderation', 'Equal voice distribution', 'Respectful community rules'],
    threeDGraphic: {
      type: 'idea',
      label: '3D Idea Resonance Stage',
      accentColor: '#F97316',
    },
  },
  {
    id: 4,
    number: '04',
    title: 'Connect Deeply & Safely',
    badge: 'Step 4: Real Connections',
    icon: Users,
    gradient: 'from-[#10b981] to-[#3B5BF6]',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    shortDesc: 'Find like-minded introverts effortlessly.',
    desc: 'Build genuine connections with thinkers who share your interests. Exit whenever you want with zero awkward goodbyes.',
    features: ['Stress-free room exit', 'Interest matching', 'Safe space for introverts'],
    threeDGraphic: {
      type: 'network',
      label: '3D Connection Mesh',
      accentColor: '#10b981',
    },
  },
];

const roles = [
  {
    id: 'listener',
    title: 'Listener 🎧',
    subtitle: 'Only Able to Listen',
    badge: 'Role 1: Passive Listener',
    icon: Headphones,
    gradient: 'from-[#7C3AED] to-[#a855f7]',
    glowColor: 'rgba(124, 58, 237, 0.4)',
    accentColor: '#7C3AED',
    desc: 'Join any room with 0% pressure. Your microphone is locked OFF. You sit back, listen quietly, and absorb ideas without any obligation to talk.',
    rules: [
      'Microphone stays locked OFF',
      'Listen silently with 0% pressure',
      'React to ideas using 👍 / 👎',
      'Raise hand anytime to speak',
    ],
    statusLabel: 'Listen-Only Mode Active',
  },
  {
    id: 'speaker',
    title: 'Speaker 🎙️',
    subtitle: 'Speaks On Their Turn',
    badge: 'Role 2: Queue Speaker',
    icon: Mic,
    gradient: 'from-[#3B5BF6] to-[#6366f1]',
    glowColor: 'rgba(59, 91, 246, 0.4)',
    accentColor: '#3B5BF6',
    desc: 'Queue up to share your thoughts. When your turn arrives, speak for up to 3 minutes with a live countdown timer before returning to listener mode.',
    rules: [
      'Speaks strictly when turn arrives',
      '3-minute live speaking timer',
      'Auto-muted when time expires',
      'Returns to listener after turn',
    ],
    statusLabel: 'Turn-Based Speaking Active',
  },
  {
    id: 'debater',
    title: 'Debater ⚡',
    subtitle: 'Speaks Anytime',
    badge: 'Role 3: Open Mic',
    icon: Scale,
    gradient: 'from-[#F97316] to-[#ef4444]',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    accentColor: '#F97316',
    desc: 'Participate actively in real-time discussions. Open microphone access lets you jump in, respond immediately, and debate ideas at any moment.',
    rules: [
      'Microphone accessible anytime',
      'Instant mute/unmute toggle',
      'Real-time debate & discussion',
      'No turn timers or waiting',
    ],
    statusLabel: 'Open-Mic Debate Active',
  },
];

export function HowDuneliWorks3D({ currentTheme }: HowDuneliWorks3DProps) {
  const [viewMode, setViewMode] = useState<'workflow' | 'roles'>('workflow');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  const [rotateX, setRotateX] = useState(8);
  const [rotateY, setRotateY] = useState(-8);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeStep = steps[activeStepIndex];
  const activeRole = roles[activeRoleIndex];

  // Mouse Parallax 3D Tilt Math
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rY = (x / (rect.width / 2)) * 16;
    const rX = -(y / (rect.height / 2)) * 16;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(8);
    setRotateY(-8);
  };

  return (
    <section id="how-duneli-works" className="py-24 px-4 sm:px-8 relative overflow-hidden my-12" ref={containerRef}>
      {/* Background Section Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div
          className="w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 transition-all duration-700"
          style={{ background: viewMode === 'workflow' ? activeStep.glowColor : activeRole.glowColor }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-sm text-xs font-bold text-[#3B5BF6] mb-4"
          >
            <Rotate3d className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Interactive 3D Stage</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-black text-[#1A1A2E] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            How <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B5BF6] via-[#7C3AED] to-[#F97316]">DUNELI</span> Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg text-[#1A1A2E]/75 mb-8"
          >
            Explore the 4-step workflow or test the 3 discussion roles in interactive 3D!
          </motion.p>

          {/* Mode Switcher: Workflow vs 3 Discussion Roles */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-md">
            <button
              onClick={() => setViewMode('workflow')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'workflow'
                  ? 'bg-[#1A1A2E] text-white shadow-md'
                  : 'text-[#1A1A2E]/70 hover:text-[#1A1A2E]'
              }`}
            >
              4-Step Workflow
            </button>
            <button
              onClick={() => setViewMode('roles')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'roles'
                  ? 'bg-[#1A1A2E] text-white shadow-md'
                  : 'text-[#1A1A2E]/70 hover:text-[#1A1A2E]'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#F97316] animate-pulse" />
              <span>3 Discussion Roles</span>
            </button>
          </div>
        </div>

        {/* 3D Interactive Stage Container */}
        <div
          className="relative min-h-[620px] lg:min-h-[580px] rounded-3xl p-4 sm:p-8 transition-all duration-300"
          style={{ perspective: '1200px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Main 3D Card Platform */}
          <motion.div
            animate={{
              rotateX: rotateX,
              rotateY: rotateY,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 14, mass: 0.8 }}
            className="w-full h-full min-h-[520px] bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_30px_80px_rgba(15,15,61,0.12)] rounded-3xl p-6 lg:p-10 relative overflow-hidden flex flex-col justify-between"
            style={{ transformStyle: 'preserve-3d' }}
          >
            
            {/* WORKFLOW VIEW MODE */}
            {viewMode === 'workflow' ? (
              <>
                {/* Top 3D Indicator Bar */}
                <div
                  className="flex items-center justify-between border-b border-[#1A1A2E]/10 pb-6 mb-8"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeStep.gradient} flex items-center justify-center text-white shadow-lg`}
                    >
                      <activeStep.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]/60">{activeStep.badge}</span>
                      <h3 className="text-xl font-extrabold text-[#1A1A2E]">{activeStep.title}</h3>
                    </div>
                  </div>
                </div>

                {/* 3D Main Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
                  
                  {/* Left Column: Workflow Selector */}
                  <div className="lg:col-span-5 flex flex-col gap-3" style={{ transform: 'translateZ(40px)' }}>
                    {steps.map((step, idx) => {
                      const isActive = idx === activeStepIndex;
                      return (
                        <button
                          key={step.id}
                          onClick={() => setActiveStepIndex(idx)}
                          className={`group relative text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 border cursor-pointer ${
                            isActive
                              ? 'bg-white shadow-xl border-white scale-[1.02] z-10'
                              : 'bg-white/40 hover:bg-white/70 border-white/50 text-[#1A1A2E]/70 hover:text-[#1A1A2E]'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm transition-all duration-300 ${
                              isActive
                                ? `bg-gradient-to-br ${step.gradient} text-white shadow-md`
                                : 'bg-[#1A1A2E]/5 text-[#1A1A2E]/80 group-hover:bg-[#1A1A2E]/10'
                            }`}
                          >
                            {step.number}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-bold truncate ${isActive ? 'text-[#1A1A2E]' : 'text-[#1A1A2E]/80'}`}>
                              {step.title}
                            </h4>
                            <p className="text-[11px] text-[#1A1A2E]/60 truncate">{step.shortDesc}</p>
                          </div>

                          <ChevronRight
                            className={`w-4 h-4 transition-transform duration-300 ${
                              isActive ? 'text-[#3B5BF6] translate-x-1' : 'text-[#1A1A2E]/30 group-hover:translate-x-0.5'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: 3D Display Card */}
                  <div className="lg:col-span-7 h-full flex items-center justify-center relative" style={{ transform: 'translateZ(80px)' }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep.id}
                        initial={{ opacity: 0, rotateY: -35, scale: 0.9 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                        exit={{ opacity: 0, rotateY: 35, scale: 0.9 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="w-full bg-white/90 backdrop-blur-xl border border-white/90 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div
                          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-40"
                          style={{ background: activeStep.threeDGraphic.accentColor }}
                        />

                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${activeStep.gradient} flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30`}
                              style={{ transform: 'translateZ(50px)' }}
                            >
                              <activeStep.icon className="w-10 h-10" />
                            </motion.div>

                            <div
                              className="px-3.5 py-1.5 rounded-full bg-[#1A1A2E]/8 border border-[#1A1A2E]/10 text-xs font-extrabold text-[#1A1A2E] flex items-center gap-2 shadow-sm"
                              style={{ transform: 'translateZ(30px)' }}
                            >
                              <div className="w-2 h-2 rounded-full animate-ping" style={{ background: activeStep.threeDGraphic.accentColor }} />
                              <span>{activeStep.threeDGraphic.label}</span>
                            </div>
                          </div>

                          <p
                            className="text-base sm:text-lg text-[#1A1A2E]/85 font-medium leading-relaxed mb-6"
                            style={{ transform: 'translateZ(40px)' }}
                          >
                            {activeStep.desc}
                          </p>

                          <div className="space-y-2.5 mb-6" style={{ transform: 'translateZ(30px)' }}>
                            {activeStep.features.map((feature, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#1A1A2E]/80">
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm"
                                  style={{ background: activeStep.threeDGraphic.accentColor }}
                                >
                                  ✓
                                </div>
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div
                          className="pt-4 border-t border-[#1A1A2E]/10 flex items-center justify-between flex-wrap gap-4"
                          style={{ transform: 'translateZ(35px)' }}
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A2E]/60">
                            <Lock className="w-3.5 h-3.5 text-[#3B5BF6]" />
                            <span>Built for privacy & peace of mind</span>
                          </div>

                          {activeStepIndex === steps.length - 1 ? (
                            <button
                              onClick={() => setActiveStepIndex((prev) => prev - 1)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A2E] hover:bg-[#2d2d4e] text-white text-xs font-extrabold shadow-md hover:scale-105 transition-all cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Previous</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveStepIndex((prev) => prev + 1)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A2E] hover:bg-[#2d2d4e] text-white text-xs font-extrabold shadow-md hover:scale-105 transition-all cursor-pointer"
                            >
                              <span>Next Step</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                </div>

                {/* Bottom Step Bar */}
                <div
                  className="mt-8 pt-6 border-t border-[#1A1A2E]/10 flex items-center justify-between"
                  style={{ transform: 'translateZ(25px)' }}
                >
                  <div className="flex items-center gap-2">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveStepIndex(i)}
                        className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                          i === activeStepIndex ? 'w-10 bg-[#3B5BF6]' : 'w-2.5 bg-[#1A1A2E]/20 hover:bg-[#1A1A2E]/40'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-bold text-[#1A1A2E]/60">
                    Step {activeStepIndex + 1} of {steps.length}
                  </span>
                </div>
              </>
            ) : (
              /* ROLES VIEW MODE (LISTENER / SPEAKER / DEBATER) */
              <>
                {/* Top 3D Indicator Bar */}
                <div
                  className="flex items-center justify-between border-b border-[#1A1A2E]/10 pb-6 mb-8"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeRole.gradient} flex items-center justify-center text-white shadow-lg`}
                    >
                      <activeRole.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]/60">{activeRole.badge}</span>
                      <h3 className="text-xl font-extrabold text-[#1A1A2E]">{activeRole.title} — <span style={{ color: activeRole.accentColor }}>{activeRole.subtitle}</span></h3>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#1A1A2E]/10 text-xs font-extrabold text-[#1A1A2E] shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ background: activeRole.accentColor }} />
                    <span>{activeRole.statusLabel}</span>
                  </div>
                </div>

                {/* 3D Main Roles Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
                  
                  {/* Left Column: 3 Roles Selector */}
                  <div className="lg:col-span-5 flex flex-col gap-4" style={{ transform: 'translateZ(40px)' }}>
                    {roles.map((roleItem, rIdx) => {
                      const isActive = rIdx === activeRoleIndex;
                      const Icon = roleItem.icon;
                      return (
                        <button
                          key={roleItem.id}
                          onClick={() => setActiveRoleIndex(rIdx)}
                          className={`group relative text-left p-5 rounded-2xl transition-all duration-300 flex items-center gap-4 border cursor-pointer ${
                            isActive
                              ? 'bg-white shadow-xl border-white scale-[1.03] z-10'
                              : 'bg-white/40 hover:bg-white/70 border-white/50 text-[#1A1A2E]/70 hover:text-[#1A1A2E]'
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm transition-all duration-300 ${
                              isActive
                                ? `bg-gradient-to-br ${roleItem.gradient} text-white shadow-md scale-105`
                                : 'bg-[#1A1A2E]/5 text-[#1A1A2E]/80 group-hover:bg-[#1A1A2E]/10'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-base font-extrabold truncate ${isActive ? 'text-[#1A1A2E]' : 'text-[#1A1A2E]/80'}`}>
                              {roleItem.title}
                            </h4>
                            <p className="text-xs font-semibold text-[#1A1A2E]/60 truncate" style={{ color: isActive ? roleItem.accentColor : undefined }}>
                              {roleItem.subtitle}
                            </p>
                          </div>

                          <ChevronRight
                            className={`w-5 h-5 transition-transform duration-300 ${
                              isActive ? 'text-[#3B5BF6] translate-x-1' : 'text-[#1A1A2E]/30 group-hover:translate-x-0.5'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: 3D Role Card Display */}
                  <div className="lg:col-span-7 h-full flex items-center justify-center relative" style={{ transform: 'translateZ(80px)' }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeRole.id}
                        initial={{ opacity: 0, rotateY: 35, scale: 0.9 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                        exit={{ opacity: 0, rotateY: -35, scale: 0.9 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="w-full bg-white/90 backdrop-blur-xl border border-white/90 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div
                          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-40"
                          style={{ background: activeRole.accentColor }}
                        />

                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${activeRole.gradient} flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30`}
                              style={{ transform: 'translateZ(50px)' }}
                            >
                              <activeRole.icon className="w-10 h-10" />
                            </motion.div>

                            <div
                              className="px-4 py-2 rounded-2xl bg-white border border-[#1A1A2E]/10 text-xs font-black text-[#1A1A2E] shadow-sm flex items-center gap-2"
                              style={{ transform: 'translateZ(30px)' }}
                            >
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: activeRole.accentColor }} />
                              <span>{activeRole.subtitle}</span>
                            </div>
                          </div>

                          <p
                            className="text-base sm:text-lg text-[#1A1A2E]/85 font-semibold leading-relaxed mb-6"
                            style={{ transform: 'translateZ(40px)' }}
                          >
                            {activeRole.desc}
                          </p>

                          <div className="space-y-3 mb-6" style={{ transform: 'translateZ(30px)' }}>
                            {activeRole.rules.map((rule, rKey) => (
                              <div key={rKey} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#1A1A2E]/80">
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm"
                                  style={{ background: activeRole.accentColor }}
                                >
                                  ✓
                                </div>
                                <span>{rule}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div
                          className="pt-4 border-t border-[#1A1A2E]/10 flex items-center justify-between flex-wrap gap-4"
                          style={{ transform: 'translateZ(35px)' }}
                        >
                          <span className="text-xs font-extrabold text-[#1A1A2E]/60">
                            Select this role when entering any room
                          </span>

                          <button
                            onClick={() => setActiveRoleIndex((prev) => (prev + 1) % roles.length)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A2E] hover:bg-[#2d2d4e] text-white text-xs font-extrabold shadow-md hover:scale-105 transition-all cursor-pointer"
                          >
                            <span>Next Role</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                </div>

                {/* Bottom Roles Selector Bar */}
                <div
                  className="mt-8 pt-6 border-t border-[#1A1A2E]/10 flex items-center justify-between"
                  style={{ transform: 'translateZ(25px)' }}
                >
                  <div className="flex items-center gap-3">
                    {roles.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveRoleIndex(i)}
                        className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                          i === activeRoleIndex ? 'w-10 bg-[#3B5BF6]' : 'w-2.5 bg-[#1A1A2E]/20 hover:bg-[#1A1A2E]/40'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-bold text-[#1A1A2E]/60">
                    Role {activeRoleIndex + 1} of {roles.length}
                  </span>
                </div>
              </>
            )}

          </motion.div>
        </div>

      </div>
    </section>
  );
}
