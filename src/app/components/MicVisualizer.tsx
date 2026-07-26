// MicVisualizer.tsx — Google Meet style
// - Circular button with mic icon in center
// - Animated ripple rings when active (like Google Meet)
// - 5 bars grow from center of the circle
// - Smooth transitions, glow on loud input
import { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface Props {
  isMuted: boolean;
  isDark: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void; // optional — make it clickable
}

const BAR_COUNT = 5;
const SMOOTHING  = 0.82;

// Heights for each bar at rest (idle breathing animation)
const IDLE_HEIGHTS = [0.25, 0.45, 0.6, 0.45, 0.25];

export function MicVisualizer({ isMuted, isDark, size = 'md', onClick }: Props) {
  const [volumes, setVolumes] = useState<number[]>(Array(BAR_COUNT).fill(0));
  const [avgVol,  setAvgVol]  = useState(0); // 0-1, drives ripple scale
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const contextRef   = useRef<AudioContext | null>(null);
  const idleRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Idle breathing animation (no mic data) ────────────────
  const startIdle = useCallback((active: { v: boolean }) => {
    let t = 0;
    idleRef.current = setInterval(() => {
      if (!active.v) { clearInterval(idleRef.current!); return; }
      const wave = Math.abs(Math.sin(t * 0.9));
      setVolumes(IDLE_HEIGHTS.map((h, i) =>
        h * 0.35 + Math.abs(Math.sin(t + i * 0.7)) * 0.22
      ));
      setAvgVol(wave * 0.3);
      t += 0.12;
    }, 50);
  }, []);

  useEffect(() => {
    if (isMuted) {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(idleRef.current!);
      // Animate bars down to zero
      setVolumes(Array(BAR_COUNT).fill(0));
      setAvgVol(0);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      contextRef.current?.close().catch(() => {});
      contextRef.current = null;
      analyserRef.current = null;
      return;
    }

    const active = { v: true };

    const startAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!active.v) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        const ctx = new AudioContext();
        contextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = SMOOTHING;
        analyserRef.current = analyser;
        ctx.createMediaStreamSource(stream).connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (!active.v) return;
          analyser.getByteFrequencyData(data);

          // Focus on human voice range: bins 2–18 (~80–700 Hz)
          const voiceStart = 2, voiceEnd = Math.min(18, data.length - 1);
          const voiceSlice = data.slice(voiceStart, voiceEnd + 1);

          // Map to 5 bars with centre-weighted heights (like Google Meet)
          const step = Math.floor(voiceSlice.length / BAR_COUNT);
          const raw = Array.from({ length: BAR_COUNT }, (_, i) => {
            const sl = voiceSlice.slice(i * step, (i + 1) * step);
            return sl.reduce((s, v) => s + v, 0) / sl.length / 255;
          });

          // Centre bar is tallest — mirror pattern: [a, b, c, b, a]
          const centre = raw[2];
          const shaped = [
            centre * 0.45 + raw[0] * 0.55,
            centre * 0.72 + raw[1] * 0.28,
            Math.min(centre * 1.1, 1),
            centre * 0.72 + raw[3] * 0.28,
            centre * 0.45 + raw[4] * 0.55,
          ];

          // Add minimum breathing so bars are never totally flat when unmuted
          const withFloor = shaped.map((v, i) => Math.max(v, IDLE_HEIGHTS[i] * 0.18));

          setVolumes(withFloor);
          setAvgVol(centre);
          animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);
      } catch {
        // No mic access — fallback to breathing animation
        startIdle(active);
      }
    };

    startAnalysis();
    return () => {
      active.v = false;
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(idleRef.current!);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      contextRef.current?.close().catch(() => {});
      contextRef.current = null;
    };
  }, [isMuted, startIdle]);

  // ── Size config ────────────────────────────────────────────
  const cfg = {
    //          circle  bar_w  barMaxH  gap   icon  bars_area_w  bars_area_h
    sm: { r: 28, bw: 2.5, bmh: 10, gap: 2.5, ic: 13, baw: 18, bah: 14 },
    md: { r: 40, bw: 3,   bmh: 16, gap: 3,   ic: 17, baw: 24, bah: 20 },
    lg: { r: 56, bw: 4,   bmh: 26, gap: 4,   ic: 22, baw: 36, bah: 30 },
  }[size];

  const diameter = cfg.r * 2;

  // Ripple scale: 1.0 at silence, up to 1.45 at full volume
  const rippleScale = isMuted ? 0 : 1 + avgVol * 0.45;
  // Glow intensity
  const glowAlpha = isMuted ? 0 : 0.18 + avgVol * 0.32;

  // Bar total width to centre them
  const totalBarW = BAR_COUNT * cfg.bw + (BAR_COUNT - 1) * cfg.gap;
  const barStartX = (diameter - totalBarW) / 2;
  const barCentreY = cfg.r; // middle of circle

  // Colors
  const activeGreen = '#22c55e';
  const mutedColor  = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)';
  const mutedBg     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const activeBg    = `rgba(34,197,94,${glowAlpha})`;

  return (
    <div
      className={`relative flex-shrink-0 select-none ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width: diameter, height: diameter }}
      onClick={onClick}
      title={isMuted ? 'Microphone muted' : 'Microphone active'}
    >
      {/* ── Ripple rings (Google Meet style) ── */}
      {!isMuted && (
        <>
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: `rgba(34,197,94,${0.10 + avgVol * 0.12})`,
              transform: `scale(${rippleScale})`,
              transition: 'transform 0.08s ease-out, background 0.08s ease-out',
            }}
          />
          {avgVol > 0.3 && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: `rgba(34,197,94,${0.06 + avgVol * 0.08})`,
                transform: `scale(${1 + avgVol * 0.75})`,
                transition: 'transform 0.12s ease-out, background 0.12s ease-out',
              }}
            />
          )}
        </>
      )}

      {/* ── Main circle ── */}
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center"
        style={{
          background: isMuted ? mutedBg : activeBg,
          border: `1.5px solid ${isMuted ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') : `rgba(34,197,94,${0.35 + avgVol * 0.4})`}`,
          transition: 'background 0.25s ease, border-color 0.25s ease',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* ── Bars SVG — centred in circle ── */}
        <svg
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          style={{ position: 'absolute', inset: 0 }}
        >
          {volumes.map((v, i) => {
            const barH = isMuted
              ? cfg.bw // collapsed to a dot when muted
              : Math.max(cfg.bw, v * cfg.bmh);
            const x = barStartX + i * (cfg.bw + cfg.gap);
            const y = barCentreY - barH / 2;
            const fillAlpha = isMuted ? 0 : 0.5 + v * 0.5;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={cfg.bw}
                height={barH}
                rx={cfg.bw / 2}
                fill={isMuted ? mutedColor : `rgba(34,197,94,${fillAlpha})`}
                style={{
                  transition: isMuted
                    ? 'height 0.4s cubic-bezier(.4,0,.2,1), y 0.4s cubic-bezier(.4,0,.2,1), fill 0.4s ease, opacity 0.4s ease'
                    : 'height 0.055s linear, y 0.055s linear',
                  filter: !isMuted && v > 0.5
                    ? `drop-shadow(0 0 ${3 + v * 4}px rgba(34,197,94,0.7))`
                    : 'none',
                }}
              />
            );
          })}
        </svg>

        {/* ── Mic icon — on top of bars ── */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {isMuted
            ? <MicOff size={cfg.ic} style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)' }} />
            : <Mic    size={cfg.ic} style={{ color: activeGreen, filter: `drop-shadow(0 0 4px rgba(34,197,94,${0.4 + avgVol * 0.4}))` }} />
          }
        </div>
      </div>
    </div>
  );
}
