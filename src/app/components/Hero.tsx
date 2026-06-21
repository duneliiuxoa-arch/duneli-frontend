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
      className="max-w-4xl mx-auto px-4 py-10 sm:px-8 sm:py-16 text-center"
    >
      <h1 
        className={`text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 ${textColor}`}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        DUNELI
      </h1>
      <p className={`text-lg sm:text-2xl md:text-3xl mb-3 sm:mb-4 ${textColor} opacity-90`}>
        Ideas compete, not people
      </p>
      <p className={`text-base sm:text-lg ${textColor} opacity-70 max-w-2xl mx-auto`}>
        Join live discussions where thoughtful ideas take center stage
      </p>
    </motion.div>
  );
}
