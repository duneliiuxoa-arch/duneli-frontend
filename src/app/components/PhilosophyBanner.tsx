import { Theme } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';
import { Mic, Headphones, Scale, Shield, Eye, Heart } from 'lucide-react';

interface PhilosophyBannerProps {
  currentTheme: Theme;
}

export function PhilosophyBanner({ currentTheme }: PhilosophyBannerProps) {
  const theme = themes[currentTheme];
  const isDuneli = currentTheme === 'duneli';

  const modes = [
    {
      icon: Mic,
      title: 'Speaker',
      titleColor: 'text-[#3B5BF6]',
      iconBg: 'from-[#3B5BF6] to-[#6366f1]',
      description: 'Share your thoughts on topics you love.',
      dividerColor: 'bg-[#3B5BF6]',
    },
    {
      icon: Headphones,
      title: 'Listen',
      titleColor: 'text-[#7C3AED]',
      iconBg: 'from-[#7C3AED] to-[#a855f7]',
      description: 'Listen to others and connect silently.',
      dividerColor: 'bg-[#7C3AED]',
    },
    {
      icon: Scale,
      title: 'Debate',
      titleColor: 'text-[#F97316]',
      iconBg: 'from-[#F97316] to-[#ef4444]',
      description: 'Exchange ideas and see different perspectives.',
      dividerColor: 'bg-[#F97316]',
    },
  ];

  const howItWorks = [
    {
      emoji: '💡',
      title: 'Ideas compete, not people',
      description: 'React to ideas during discussions, never to individuals',
    },
    {
      emoji: '🎙️',
      title: 'Request to speak',
      description: 'Raise your hand to join the conversation thoughtfully',
    },
    {
      emoji: '👍',
      title: 'React to ideas',
      description: 'Show agreement or disagreement with specific points',
    },
    {
      emoji: '🤝',
      title: 'Listen and learn',
      description: 'Participation is optional; listening is always valuable',
    },
  ];

  if (!isDuneli) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${theme.cardStyle} rounded-3xl p-8`}
        >
          <h2
            className={`text-center text-2xl font-bold ${theme.textColor} opacity-90 mb-8`}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            How Duneli Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className={`font-semibold ${theme.textColor} mb-2`}>{item.title}</h3>
                <p className={`text-sm ${theme.textColor} opacity-70`}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Dark navy section — matching poster bottom */}
      <div
        className="py-16 px-6 lg:px-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0f3d 0%, #1a1044 50%, #0d1b4b 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3B5BF6, transparent)' }} />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Section heading */}
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-black text-white mb-3"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em' }}
              >
                Choose Your Mode.{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #3B5BF6, #7C3AED)' }}
                >
                  Connect with Anyone.
                </span>
              </h2>
              <p className="text-white/50 text-base">
                For introverts who want to talk, but hesitate to speak.
              </p>
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {modes.map((mode, index) => (
                <motion.div
                  key={mode.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center hover:bg-white/15 transition-colors"
                >
                  {/* Waveform decoration */}
                  <div className="flex items-center justify-center gap-1 mb-4 opacity-30">
                    {[2, 4, 6, 8, 5, 3, 7, 4, 2].map((h, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full bg-white"
                        style={{ height: `${h * 2}px` }}
                      />
                    ))}
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.iconBg} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    <mode.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3
                    className={`text-xl font-bold mb-1 ${mode.titleColor}`}
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {mode.title}
                  </h3>
                  <div className={`w-8 h-0.5 rounded-full ${mode.dividerColor} mx-auto mb-3`} />
                  <p className="text-white/60 text-sm leading-relaxed">{mode.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Bottom bar — like poster */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3B5BF6] to-[#7C3AED] flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>No Pressure.</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#a855f7] flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>No Exposure.</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F97316] to-[#ef4444] flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>Just Real Conversations.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
