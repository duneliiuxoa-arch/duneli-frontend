import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion, useMotionValue, useTransform, useSpring } from 'motion/react';
import {
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Radio,
  Mic,
  Headphones,
  Scale,
  Heart,
  Sparkles,
  Building2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import duneliLogo from '../../../assets/logo.png';

interface FooterLink {
  title: string;
  href: string;
}

interface FooterColumn {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  accent: string;
  links: FooterLink[];
}

interface SocialLink {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const footerColumns: FooterColumn[] = [
  {
    label: 'Product',
    icon: Sparkles,
    tint: '#EEF2FF',
    accent: '#3B5BF6',
    links: [
      { title: 'Live Audio Rooms', href: '#shutter' },
      { title: 'How Duneli Works', href: '#how-duneli-works' },
      { title: 'Dunora', href: 'https://dunora-next.vercel.app' },
      { title: 'Schedule a Discussion', href: '#search-bar' },
    ],
  },
  {
    label: 'Company',
    icon: Building2,
    tint: '#F5F3FF',
    accent: '#7C3AED',
    links: [
      { title: 'About Us', href: '/about' },
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    label: 'Resources',
    icon: BookOpen,
    tint: '#FFF7ED',
    accent: '#F97316',
    links: [
      { title: 'Community Guidelines', href: '/guidelines' },
      { title: 'Help Center', href: '/help' },
      { title: 'FAQs', href: '/faqs' },
      { title: 'Contact Us', href: '/contact' },
    ],
  },
];

const socialLinks: SocialLink[] = [
  { title: 'Instagram', href: '#', icon: Instagram, color: '#E1306C' },
  { title: 'Twitter / X', href: '#', icon: Twitter, color: '#1DA1F2' },
  { title: 'YouTube', href: '#', icon: Youtube, color: '#FF0000' },
  { title: 'LinkedIn', href: '#', icon: Linkedin, color: '#0A66C2' },
];

export interface FooterProps {
  onOpenShutter?: () => void;
  onPrivacyPolicyClick?: () => void;
  onAboutUsClick?: () => void;
  onTermsClick?: () => void;
  onGuidelinesClick?: () => void;
  onHelpClick?: () => void;
  onFaqClick?: () => void;
  onContactClick?: () => void;
}

export function Footer({
  onOpenShutter,
  onPrivacyPolicyClick,
  onAboutUsClick,
  onTermsClick,
  onGuidelinesClick,
  onHelpClick,
  onFaqClick,
  onContactClick,
}: FooterProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer
      className="relative w-full overflow-hidden border-t border-blue-100"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f5f7ff 100%)' }}
    >
      {/* Ambient floating blobs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a5b4fc, transparent)' }}
        animate={shouldReduceMotion ? {} : { scale: [1, 1.15, 1], x: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ddd6fe, transparent)' }}
        animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1], y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Top glow divider */}
      <div
        className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur"
        style={{ background: 'linear-gradient(90deg, #3B5BF6, #7C3AED, #F97316)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-16">
        {/* Bouncy CTA banner */}
        <AnimatedContainer className="mb-12">
          <div
            className="relative rounded-3xl px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden border border-white"
            style={{ background: 'linear-gradient(120deg, #EEF2FF 0%, #F5F3FF 50%, #FFF7ED 100%)' }}
          >
            <FloatingSticker icon={Mic} color="#3B5BF6" className="-top-4 left-10 hidden sm:flex" delay={0} />
            <FloatingSticker icon={Headphones} color="#7C3AED" className="-bottom-4 left-1/3 hidden sm:flex" delay={0.6} />
            <FloatingSticker icon={Scale} color="#F97316" className="-top-3 right-16 hidden sm:flex" delay={1.2} />

            <div className="text-center sm:text-left">
              <h3
                className="text-xl sm:text-2xl font-black text-[#1A1A2E]"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Got a thought worth sharing? 💭
              </h3>
              <p className="text-[#1A1A2E]/60 text-sm mt-1">
                No pressure, no exposure — just hop in whenever you're ready.
              </p>
            </div>

            <motion.a
              href="#shutter"
              onClick={(e) => {
                e.preventDefault();
                if (onOpenShutter) onOpenShutter();
                window.dispatchEvent(new Event('open-shutter-drawer'));
              }}
              className="relative inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-extrabold text-sm select-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)',
                boxShadow: '0 6px 0 0 #2947c9, 0 14px 24px rgba(59,91,246,0.35)',
              }}
              whileHover={shouldReduceMotion ? {} : { y: -2 }}
              whileTap={
                shouldReduceMotion
                  ? {}
                  : { y: 4, boxShadow: '0 2px 0 0 #2947c9, 0 6px 14px rgba(59,91,246,0.3)' }
              }
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span>Start a Conversation</span>
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </AnimatedContainer>

        {/* Main grid: brand card + link cards */}
        <div className="grid w-full gap-6 xl:grid-cols-3">
          {/* Brand tilt card */}
          <TiltCard className="relative rounded-3xl p-7 border border-blue-100 bg-white shadow-[0_10px_30px_rgba(59,91,246,0.08)]">
            <FloatingSticker icon={Heart} color="#F97316" className="flex -top-4 -right-3" delay={0.3} />

            <motion.div
              className="flex items-center gap-3"
              whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <motion.img
                src={duneliLogo}
                alt="Duneli"
                draggable={false}
                className="h-9 w-auto object-contain select-none"
                whileHover={shouldReduceMotion ? {} : { rotate: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              />
            </motion.div>

            <p className="text-[#1A1A2E]/60 text-sm max-w-xs leading-relaxed mt-4">
              Speak freely, connect deeply. Anonymous audio rooms for introverts who want to
              talk, but hesitate to speak.
            </p>

            <div className="flex items-center gap-2 text-[#1A1A2E]/60 text-xs mt-4 bg-red-50 border border-red-100 w-fit px-3 py-1.5 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
              <Radio className="w-3.5 h-3.5 text-red-500" />
              <span className="font-semibold">10K+ deep thinkers listening in</span>
            </div>

            {/* Bouncy social icons */}
            <div className="flex items-center gap-2.5 mt-6">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={social.title}
                  href={social.href}
                  aria-label={social.title}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm border border-white"
                  style={{ background: social.color }}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : { scale: 1.2, rotate: i % 2 === 0 ? -10 : 10, y: -3 }
                  }
                  whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                >
                  <social.icon className="w-4 h-4 text-white" />
                </motion.a>
              ))}
            </div>

            <p className="text-[#1A1A2E]/40 text-xs pt-6">
              © {new Date().getFullYear()} Duneli. All rights reserved.
            </p>
          </TiltCard>

          {/* Pastel link tilt-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 xl:col-span-2">
            {footerColumns.map((column) => (
              <TiltCard
                key={column.label}
                className="rounded-3xl p-6 border border-white shadow-[0_10px_24px_rgba(15,15,61,0.06)]"
                style={{ background: column.tint }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md mb-4"
                  style={{ background: column.accent }}
                >
                  <column.icon className="w-5 h-5 text-white" />
                </div>

                <h3
                  className="text-sm font-extrabold uppercase tracking-wider mb-4"
                  style={{ color: column.accent }}
                >
                  {column.label}
                </h3>

                <ul className="space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.title}>
                      {link.title === 'Contact Us' ? (
                        <div className="flex flex-col gap-0.5 pt-1">
                          <span className="text-[#1A1A2E]/80 font-extrabold text-sm">Contact Us</span>
                          <a
                            href="mailto:Iuxoa.officail@gmail.com"
                            className="text-xs text-[#3B5BF6] font-bold hover:underline select-all flex items-center gap-1"
                          >
                            <span>Iuxoa.officail@gmail.com</span>
                          </a>
                        </div>
                      ) : (
                        <motion.a
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            if (link.title === 'Live Audio Rooms') {
                              if (onOpenShutter) onOpenShutter();
                              window.dispatchEvent(new Event('open-shutter-drawer'));
                            } else if (link.title === 'How Duneli Works') {
                              const el = document.getElementById('how-duneli-works');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            } else if (link.title === 'Dunora') {
                              window.open('https://dunora-next.vercel.app', '_blank');
                            } else if (link.title === 'Schedule a Discussion') {
                              if (onOpenShutter) onOpenShutter();
                              window.dispatchEvent(new Event('open-shutter-drawer'));
                              setTimeout(() => {
                                const input = document.getElementById('search-bar-input') as HTMLInputElement;
                                if (input) {
                                  input.focus();
                                }
                              }, 350);
                            } else if (link.title === 'About Us') {
                              if (onAboutUsClick) onAboutUsClick();
                            } else if (link.title === 'Privacy Policy') {
                              if (onPrivacyPolicyClick) onPrivacyPolicyClick();
                            } else if (link.title === 'Terms of Service') {
                              if (onTermsClick) onTermsClick();
                            } else if (link.title === 'Community Guidelines') {
                              if (onGuidelinesClick) onGuidelinesClick();
                            } else if (link.title === 'Help Center') {
                              if (onHelpClick) onHelpClick();
                            } else if (link.title === 'FAQs') {
                              if (onFaqClick) onFaqClick();
                            }
                          }}
                          className="text-[#1A1A2E]/60 inline-flex items-center gap-1.5 font-medium cursor-pointer"
                          whileHover={
                            shouldReduceMotion
                              ? { color: column.accent }
                              : { x: 4, color: column.accent }
                          }
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          {link.title}
                        </motion.a>
                      )}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <AnimatedContainer delay={0.3}>
          <div className="mt-10 pt-6 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#1A1A2E]/60 text-xs text-center sm:text-left font-medium flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-[#7C3AED] uppercase tracking-wider bg-purple-50 border border-purple-100/90 px-2.5 py-0.5 rounded-full shadow-xs">
                POWERED BY IUXOA
              </span>
              <span>Built for introverts, with 🎧. No pressure. No exposure. Just real conversations.</span>
            </p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['#3B5BF6', '#7C3AED', '#F97316', '#10b981'].map((color, i) => (
                  <motion.div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm"
                    style={{ background: color }}
                    animate={shouldReduceMotion ? {} : { y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                  >
                    {String.fromCharCode(65 + i)}
                  </motion.div>
                ))}
              </div>
              <span className="text-[#1A1A2E]/50 text-xs font-semibold">10K+ Users</span>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ translateY: 12, opacity: 0 }}
      whileInView={{ translateY: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type TiltCardProps = {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
};

function TiltCard({ className, style, children }: TiltCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-60, 60], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-60, 60], [-8, 8]), { stiffness: 200, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{
        ...style,
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
      }}
      className={`relative ${className ?? ''}`}
    >
      {children}
    </motion.div>
  );
}

type FloatingStickerProps = {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  className?: string;
  delay?: number;
};

function FloatingSticker({ icon: Icon, color, className, delay = 0 }: FloatingStickerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`absolute z-20 w-10 h-10 rounded-2xl items-center justify-center shadow-lg border-2 border-white ${className ?? 'flex'}`}
      style={{ background: color }}
      animate={shouldReduceMotion ? {} : { y: [0, -10, 0], rotate: [0, -8, 8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <Icon className="w-4 h-4 text-white" />
    </motion.div>
  );
}
