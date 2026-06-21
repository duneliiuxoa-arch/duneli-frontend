import { Theme } from '../types';
import { motion } from 'motion/react';

interface HeroProps {
  currentTheme: Theme;
  textColor: string;
}

export function Hero({ textColor }: HeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-8 py-16 text-center"
    >
      <h1 
        className={`text-5xl sm:text-7xl font-bold mb-6 ${textColor}`}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        DUNELI
      </h1>
      <p className={`text-2xl sm:text-3xl mb-4 ${textColor} opacity-90`}>
        Ideas compete, not people
      </p>
      <p className={`text-lg ${textColor} opacity-70 max-w-2xl mx-auto`}>
        Join live discussions where thoughtful ideas take center stage
      </p>
    </motion.div>
  );
}
