import type { ReactNode, CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
}

/**
 * Glassmorphism card with a thin glowing gradient border, used throughout
 * the futuristic theme. Relies on the `.nova-glass` / `.nova-glow-border`
 * utility classes defined in theme.css (scoped under `.theme-futuristic`).
 */
export function GlassCard({ children, className = '', style, hover = true }: GlassCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={hover && !shouldReduceMotion ? { y: -6, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`nova-glass nova-glow-border rounded-3xl ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}


