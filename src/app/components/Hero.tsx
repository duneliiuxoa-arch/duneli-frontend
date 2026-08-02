import { Theme } from '../types';
import { motion } from 'motion/react';
import { AuroraBackground } from './AuroraBackground';

interface HeroProps {
  currentTheme: Theme;
  textColor: string;
  onReadMore?: (title: string) => void;
}

const leftCards = [
  {
    title: '100% Anonymous',
    desc: 'No real names or avatars. Speak freely without social anxiety or profile judgement.',
    gradientFrom: '#3B5BF6',
    gradientTo: '#7C3AED',
    badge: 'Anonymous',
    floatDelay: '0s',
    offsetClass: '-translate-y-10 z-10',
    connectorPath: '',
    svgClass: '',
    viewBox: '0 0 1 1',
  },
  {
    title: 'Zero Pressure',
    desc: 'Listen silently with 0% expectation to speak. Turn on your mic only when ready.',
    gradientFrom: '#7C3AED',
    gradientTo: '#a855f7',
    badge: 'No Pressure',
    floatDelay: '0.8s',
    offsetClass: 'translate-y-8 z-30',
    connectorPath: 'M 0 45 C 50 45, 95 24, 152 20',
    svgClass: 'absolute top-3 left-[192px] w-[160px] h-[60px] pointer-events-none -z-10 hidden lg:block',
    viewBox: '0 0 160 60',
  },
];

const rightCards = [
  {
    title: '10K+ Deep Thinkers',
    desc: 'Join live, thoughtful audio rooms hosted daily by like-minded introverts.',
    gradientFrom: '#F97316',
    gradientTo: '#ef4444',
    badge: 'Live Rooms',
    floatDelay: '0.4s',
    offsetClass: '-translate-y-8 z-30',
    connectorPath: 'M 155 12 C 100 12, 50 72, 6 86',
    svgClass: 'absolute top-12 right-[192px] w-[160px] h-[100px] pointer-events-none -z-10 hidden lg:block',
    viewBox: '0 0 160 100',
  },
  {
    title: 'Ideas Over Clout',
    desc: 'Ideas compete, not popularity. Judgement-free space for deep dialogues.',
    gradientFrom: '#10b981',
    gradientTo: '#3B5BF6',
    badge: 'Pure Ideas',
    floatDelay: '1.2s',
    offsetClass: 'translate-y-10 z-10',
    connectorPath: '',
    svgClass: '',
    viewBox: '0 0 1 1',
  },
];

export function Hero({ currentTheme, textColor, onReadMore }: HeroProps) {
  return (
    <div className="relative overflow-hidden w-full min-h-[90vh] pb-16 pt-4">
      {/* Background 100% Intensity Text "DUNELI" Shifted Up */}
      <div className="absolute inset-0 flex items-start justify-center pt-8 pointer-events-none select-none z-0 overflow-hidden opacity-100">
        <span
          className="text-[20vw] font-black tracking-tight uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-[#3B5BF6] via-[#7C3AED] to-[#F97316] whitespace-nowrap"
          style={{ fontFamily: 'Unbounded, sans-serif', letterSpacing: '-0.04em' }}
        >
          DUNELI
        </span>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 flex flex-col justify-center relative z-10">
        {/* Connected Row: Zig-Zag Floating Cards + Center Text Balanced */}
        <div className="relative w-full pt-52 sm:pt-56 lg:pt-64">
          <div className="flex items-center justify-between gap-3 lg:gap-5 flex-wrap lg:flex-nowrap relative z-10">

            {/* Left 2 Cards */}
            <div className="flex items-center gap-3 lg:gap-5 shrink-0 mx-auto lg:mx-0">
              {leftCards.map(({ title, desc, gradientFrom, gradientTo, badge, floatDelay, offsetClass, connectorPath, svgClass, viewBox }, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (idx + 1) }}
                  className={`group relative w-[165px] sm:w-[185px] lg:w-[200px] xl:w-[225px] h-[230px] sm:h-[250px] lg:h-[265px] xl:h-[280px] transition-all duration-500 animate-float ${offsetClass}`}
                  style={{ animationDelay: floatDelay }}
                >
                  {/* Glowing connector line attached directly to THIS card */}
                  {connectorPath && (
                    <svg className={svgClass} viewBox={viewBox} fill="none">
                      <defs>
                        <linearGradient id={`grad-l-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={gradientFrom} />
                          <stop offset="100%" stopColor={gradientTo} />
                        </linearGradient>
                      </defs>
                      <path
                        d={connectorPath}
                        stroke={`url(#grad-l-${idx})`}
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="animate-linePulse drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                      />
                    </svg>
                  )}

                  {/* Skewed gradient panels */}
                  <span
                    className="absolute top-0 left-[30px] w-1/2 h-full rounded-2xl transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[12px] group-hover:w-[calc(100%-24px)]"
                    style={{
                      background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
                    }}
                  />
                  <span
                    className="absolute top-0 left-[30px] w-1/2 h-full rounded-2xl transform skew-x-[15deg] blur-[20px] opacity-60 transition-all duration-500 group-hover:skew-x-0 group-hover:left-[12px] group-hover:w-[calc(100%-24px)]"
                    style={{
                      background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
                    }}
                  />

                  {/* Animated blur blobs */}
                  <span className="pointer-events-none absolute inset-0 z-10">
                    <span className="absolute top-0 left-0 w-0 h-0 rounded-xl opacity-0 bg-white/20 backdrop-blur-[10px] shadow-lg transition-all duration-300 animate-blob group-hover:-top-3 group-hover:left-3 group-hover:w-14 group-hover:h-14 group-hover:opacity-100" />
                    <span className="absolute bottom-0 right-0 w-0 h-0 rounded-xl opacity-0 bg-white/20 backdrop-blur-[10px] shadow-lg transition-all duration-500 animate-blob animation-delay-1000 group-hover:-bottom-3 group-hover:right-3 group-hover:w-14 group-hover:h-14 group-hover:opacity-100" />
                  </span>

                  {/* Glass Card Content */}
                  <div
                    onClick={() => onReadMore?.(title)}
                    className="relative z-20 p-4 sm:p-5 bg-white/90 backdrop-blur-xl border border-white/80 shadow-2xl rounded-2xl text-[#1A1A2E] h-full flex flex-col justify-between overflow-hidden transition-all duration-500 group-hover:-translate-y-2 cursor-pointer"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white mb-2 sm:mb-3 shadow-sm" style={{ background: gradientFrom }}>
                        {badge}
                      </span>
                      <h3 className="text-xs sm:text-sm lg:text-base font-extrabold text-[#1A1A2E] mb-1.5 leading-snug">{title}</h3>
                      <p className="text-[10px] sm:text-xs text-[#1A1A2E]/75 leading-relaxed">{desc}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReadMore?.(title);
                      }}
                      className="mt-3 px-3.5 py-1.5 bg-[#1A1A2E] text-white text-[10px] sm:text-xs font-extrabold rounded-lg hover:scale-105 hover:bg-[#2d2d4e] transition-all shadow-md self-start cursor-pointer"
                    >
                      Read More
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Center Headline & Paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center px-2 lg:px-4 max-w-sm lg:max-w-lg xl:max-w-2xl mx-auto flex-1 min-w-0 z-40 relative"
            >
              <h1
                className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-[#1A1A2E] leading-tight mb-4"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.03em' }}
              >
                <span className="block whitespace-nowrap">Speak freely,</span>
                <span
                  className="block bg-clip-text text-transparent whitespace-nowrap"
                  style={{ backgroundImage: 'linear-gradient(90deg, #3B5BF6, #7C3AED)' }}
                >
                  connect deeply.
                </span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl text-[#1A1A2E]/75 max-w-xl mx-auto leading-relaxed">
                For Introverts who want to talk, but hesitate to speak.{' '}
                <span className="font-semibold text-[#F97316]">Stay Anonymous.</span>{' '}
                No pressure. Just real conversations.
              </p>
            </motion.div>

            {/* Right 2 Skew Cards */}
            <div className="flex items-center gap-3 lg:gap-5 shrink-0 mx-auto lg:mx-0">
              {rightCards.map(({ title, desc, gradientFrom, gradientTo, badge, floatDelay, offsetClass, connectorPath, svgClass, viewBox }, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (idx + 1) }}
                  className={`group relative w-[165px] sm:w-[185px] lg:w-[200px] xl:w-[225px] h-[230px] sm:h-[250px] lg:h-[265px] xl:h-[280px] transition-all duration-500 animate-float ${offsetClass}`}
                  style={{ animationDelay: floatDelay }}
                >
                  {/* Glowing connector line attached directly to THIS card */}
                  {connectorPath && (
                    <svg className={svgClass} viewBox={viewBox} fill="none">
                      <defs>
                        <linearGradient id={`grad-r-${idx}`} x1="100%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={gradientFrom} />
                          <stop offset="100%" stopColor={gradientTo} />
                        </linearGradient>
                      </defs>
                      <path
                        d={connectorPath}
                        stroke={`url(#grad-r-${idx})`}
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="animate-linePulse drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                      />
                    </svg>
                  )}

                  {/* Skewed gradient panels */}
                  <span
                    className="absolute top-0 left-[30px] w-1/2 h-full rounded-2xl transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[12px] group-hover:w-[calc(100%-24px)]"
                    style={{
                      background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
                    }}
                  />
                  <span
                    className="absolute top-0 left-[30px] w-1/2 h-full rounded-2xl transform skew-x-[15deg] blur-[20px] opacity-60 transition-all duration-500 group-hover:skew-x-0 group-hover:left-[12px] group-hover:w-[calc(100%-24px)]"
                    style={{
                      background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
                    }}
                  />

                  {/* Animated blur blobs */}
                  <span className="pointer-events-none absolute inset-0 z-10">
                    <span className="absolute top-0 left-0 w-0 h-0 rounded-xl opacity-0 bg-white/20 backdrop-blur-[10px] shadow-lg transition-all duration-300 animate-blob group-hover:-top-3 group-hover:left-3 group-hover:w-14 group-hover:h-14 group-hover:opacity-100" />
                    <span className="absolute bottom-0 right-0 w-0 h-0 rounded-xl opacity-0 bg-white/20 backdrop-blur-[10px] shadow-lg transition-all duration-500 animate-blob animation-delay-1000 group-hover:-bottom-3 group-hover:right-3 group-hover:w-14 group-hover:h-14 group-hover:opacity-100" />
                  </span>

                  {/* Glass Card Content */}
                  <div
                    onClick={() => onReadMore?.(title)}
                    className="relative z-20 p-4 sm:p-5 bg-white/90 backdrop-blur-xl border border-white/80 shadow-2xl rounded-2xl text-[#1A1A2E] h-full flex flex-col justify-between overflow-hidden transition-all duration-500 group-hover:-translate-y-2 cursor-pointer"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white mb-2 sm:mb-3 shadow-sm" style={{ background: gradientFrom }}>
                        {badge}
                      </span>
                      <h3 className="text-xs sm:text-sm lg:text-base font-extrabold text-[#1A1A2E] mb-1.5 leading-snug">{title}</h3>
                      <p className="text-[10px] sm:text-xs text-[#1A1A2E]/75 leading-relaxed">{desc}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReadMore?.(title);
                      }}
                      className="mt-3 px-3.5 py-1.5 bg-[#1A1A2E] text-white text-[10px] sm:text-xs font-extrabold rounded-lg hover:scale-105 hover:bg-[#2d2d4e] transition-all shadow-md self-start cursor-pointer"
                    >
                      Read More
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Animation keyframes style */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        .animate-float {
          animation: float 3.5s ease-in-out infinite;
        }

        @keyframes linePulse {
          0%, 100% { opacity: 0.75; stroke-dashoffset: 0; }
          50% { opacity: 1; stroke-dashoffset: -10; }
        }
        .animate-linePulse {
          animation: linePulse 3s ease-in-out infinite;
        }

        @keyframes blob {
          0%, 100% { transform: translateY(6px); }
          50% { transform: translate(-6px); }
        }
        .animate-blob { animation: blob 2s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: -1s; }
      `}</style>
    </div>
  );
}


