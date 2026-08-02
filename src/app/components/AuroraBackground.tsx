import { cn } from "../../lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  variant?: 'light' | 'futuristic';
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  variant = 'light',
  ...props
}: AuroraBackgroundProps) => {
  if (variant === 'futuristic') {
    return (
      <main className="relative w-full min-h-screen bg-[#05060a]">
        <div
          className={cn(
            "relative flex flex-col items-center justify-start text-[#eef2ff] transition-bg overflow-hidden min-h-screen w-full",
            className
          )}
          {...props}
        >
          {/* Deep space base */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle at 20% -10%, #0f1a3d 0%, #05060a 55%, #05060a 100%)' }}
          />

          {/* Ambient neon glow blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div
              className="absolute top-[-10%] left-[10%] w-[45vw] h-[45vw] rounded-full nova-glow-pulse"
              style={{ background: 'radial-gradient(circle, rgba(75,245,255,0.16), transparent 70%)' }}
            />
            <div
              className="absolute bottom-[-15%] right-[5%] w-[50vw] h-[50vw] rounded-full nova-glow-pulse"
              style={{ background: 'radial-gradient(circle, rgba(79,125,255,0.14), transparent 70%)', animationDelay: '1.5s' }}
            />
            <div
              className="absolute top-[30%] right-[25%] w-[25vw] h-[25vw] rounded-full nova-glow-pulse"
              style={{ background: 'radial-gradient(circle, rgba(139,107,255,0.12), transparent 70%)', animationDelay: '0.8s' }}
            />
          </div>

          {/* Fine grid overlay for tech texture */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-[0.15]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(120,190,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(120,190,255,0.4) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, black 40%, transparent 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 w-full">{children}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full min-h-screen">
      <div
        className={cn(
          "relative flex flex-col items-center justify-start bg-slate-50 text-slate-950 transition-bg overflow-hidden min-h-screen w-full",
          className
        )}
        {...props}
      >
        {/* Bright Clean Light Aurora Layer (GPU-smooth static gradients) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)' }}
          />
          <div
            className="absolute top-[20%] right-[-10%] w-[55vw] h-[55vw] rounded-full opacity-35 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.16), transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-10%] left-[20%] w-[65vw] h-[65vw] rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </main>
  );
};
