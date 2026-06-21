import { Theme } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';

interface PhilosophyBannerProps {
  currentTheme: Theme;
}

export function PhilosophyBanner({ currentTheme }: PhilosophyBannerProps) {
  const theme = themes[currentTheme];

  const howItWorks = [
    { 
      emoji: '💡', 
      title: 'Ideas compete, not people',
      description: 'React to ideas during discussions, never to individuals'
    },
    { 
      emoji: '🎙️', 
      title: 'Request to speak',
      description: 'Raise your hand to join the conversation thoughtfully'
    },
    { 
      emoji: '👍', 
      title: 'React to ideas',
      description: 'Show agreement or disagreement with specific points'
    },
    { 
      emoji: '🤝', 
      title: 'Listen and learn',
      description: 'Participation is optional; listening is always valuable'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${theme.cardStyle} rounded-3xl p-8`}
      >
        <h2 
          className={`text-center text-2xl font-bold ${theme.textColor} opacity-90 mb-8`}
          style={{ fontFamily: 'var(--font-heading)' }}
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
              <h3 className={`font-semibold ${theme.textColor} mb-2`}>
                {item.title}
              </h3>
              <p className={`text-sm ${theme.textColor} opacity-70`}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
