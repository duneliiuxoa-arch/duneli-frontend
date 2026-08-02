import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number; // duration in ms before starting fade out
}

export function SplashScreen({ onFinish, duration = 2200 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 select-none"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {/* Centered Stylish POWERED BY IUXOA Content */}
          <div className="relative flex flex-col items-center justify-center text-center">
            {/* Top text (No background card, no icon/emoji) */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] text-[#1A1A2E]/50 mb-2"
            >
              POWERED BY
            </motion.p>

            {/* Main Stylish IUXOA Logo Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 15, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.25 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.18em] text-[#1A1A2E]"
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #3B5BF6 0%, #7C3AED 50%, #F97316 100%)',
                }}
              >
                IUXOA
              </span>
            </motion.h1>


          </div>

          {/* Bottom subtle progress line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-12 w-48 h-1 bg-slate-100 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-[#3B5BF6] via-[#7C3AED] to-[#F97316] rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
