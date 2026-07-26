// MicVisualizer.tsx
// Real-time mic volume visualizer using Web Audio API
// Shows animated bars when mic is active, flat bars when muted
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface Props {
  isMuted: boolean;
  isDark: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BAR_COUNT = 5;

export function MicVisualizer({ isMuted, isDark, size = 'md' }: Props) {
  const [volumes, setVolumes]   = useState<number[]>(Array(BAR_COUNT).fill(0));
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const contextRef   = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isMuted) {
      cancelAnimationFrame(animFrameRef.current);
      setVolumes(Array(BAR_COUNT).fill(0));
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      contextRef.current?.close().catch(() => {});
      contextRef.current = null;
      analyserRef.current = null;
      return;
    }

    let active = true;

    const pulseSimulate = () => {
      let t = 0;
      const sim = setInterval(() => {
        if (!active) { clearInterval(sim); return; }
        setVolumes(Array.from({ length: BAR_COUNT }, (_, i) =>
          Math.abs(Math.sin(t + i * 0.8)) * 0.5
        ));
        t += 0.25;
      }, 80);
      return sim;
    };

    const startAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const ctx = new AudioContext();
        contextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.75;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!active) return;
          analyser.getByteFrequencyData(dataArray);
          const step = Math.floor(dataArray.length / BAR_COUNT);
          setVolumes(Array.from({ length: BAR_COUNT }, (_, i) => {
            const slice = dataArray.slice(i * step, (i + 1) * step);
            return Math.min(slice.reduce((s, v) => s + v, 0) / slice.length / 255, 1);
          }));
          animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
      } catch {
        // No mic access — fallback to gentle animation
        if (active) pulseSimulate();
      }
    };

    startAnalysis();
    return () => {
      active = false;
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      contextRef.current?.close().catch(() => {});
      contextRef.current = null;
    };
  }, [isMuted]);

  const cfg = {
    sm: { barW: 3, barMaxH: 14, gap: 2, iconSize: 12, wrapH: 18, radius: 2 },
    md: { barW: 4, barMaxH: 26, gap: 3, iconSize: 15, wrapH: 34, radius: 3 },
    lg: { barW: 5, barMaxH: 42, gap: 4, iconSize: 18, wrapH: 54, radius: 3 },
  }[size];

  const totalW = BAR_COUNT * cfg.barW + (BAR_COUNT - 1) * cfg.gap;
  const muteColor  = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Mic icon */}
      <div className="relative flex-shrink-0">
        {isMuted
          ? <MicOff size={cfg.iconSize} style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.28)' }} />
          : <>
              <Mic size={cfg.iconSize} style={{ color: '#22c55e' }} />
              <span className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'rgba(34,197,94,0.35)', transform: 'scale(1.9)', opacity: 0.5 }} />
            </>
        }
      </div>

      {/* Bars SVG */}
      <svg width={totalW} height={cfg.wrapH} viewBox={`0 0 ${totalW} ${cfg.wrapH}`} style={{ overflow: 'visible' }}>
        {volumes.map((v, i) => {
          const barH = isMuted ? cfg.barW : Math.max(cfg.barW, v * cfg.barMaxH);
          const x    = i * (cfg.barW + cfg.gap);
          const y    = (cfg.wrapH - barH) / 2;
          return (
            <rect key={i} x={x} y={y} width={cfg.barW} height={barH} rx={cfg.radius}
              fill={isMuted ? muteColor : `rgba(34,197,94,${0.45 + v * 0.55})`}
              style={{
                transition: isMuted
                  ? 'height 0.35s ease, y 0.35s ease, fill 0.35s ease'
                  : 'height 0.07s linear, y 0.07s linear',
                filter: !isMuted && v > 0.45 ? 'drop-shadow(0 0 4px rgba(34,197,94,0.5))' : 'none',
              }}
            />
          );
        })}
      </svg>

      {/* Status label */}
      {size !== 'sm' && (
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
          color: isMuted
            ? isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
            : '#22c55e',
        }}>
          {isMuted ? 'MUTED' : 'LIVE'}
        </span>
      )}
    </div>
  );
}
