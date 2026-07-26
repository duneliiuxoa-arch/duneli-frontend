// MicVisualizer.tsx — Canvas-based, fluid wave animation
import { useEffect, useRef, useState } from 'react';
import { MicOff } from 'lucide-react';

interface Props {
  isMuted: boolean;
  isDark: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function MicVisualizer({ isMuted, isDark, size = 'md', onClick }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const ctxAudioRef  = useRef<AudioContext | null>(null);
  const animRef      = useRef<number>(0);
  const volRef       = useRef(0);     // smoothed volume 0-1
  const phaseRef     = useRef(0);     // wave phase for idle breathing

  const D = { sm: 52, md: 72, lg: 100 }[size];
  const R = D / 2;

  // ── Accent: indigo/violet gradient (not green) ────────────
  const C1 = '#818cf8'; // indigo-400
  const C2 = '#a78bfa'; // violet-400
  const C3 = '#6366f1'; // indigo-500

  // ── Start audio analysis ──────────────────────────────────
  useEffect(() => {
    if (isMuted) {
      cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      ctxAudioRef.current?.close().catch(() => {});
      ctxAudioRef.current = null;
      analyserRef.current = null;
      volRef.current = 0;
      drawLoop(true); // draw muted state once
      return;
    }

    let alive = true;

    const boot = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!alive) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const ac = new AudioContext();
        ctxAudioRef.current = ac;
        const an = ac.createAnalyser();
        an.fftSize = 256;
        an.smoothingTimeConstant = 0.8;
        analyserRef.current = an;
        ac.createMediaStreamSource(stream).connect(an);
      } catch { /* no mic — idle animation */ }

      drawLoop(false);
    };

    boot();
    return () => {
      alive = false;
      cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      ctxAudioRef.current?.close().catch(() => {});
      streamRef.current = null;
      ctxAudioRef.current = null;
      analyserRef.current = null;
    };
  }, [isMuted]);

  // ── Main draw loop ────────────────────────────────────────
  const drawLoop = (muted: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 2;

      // ── Get volume ───────────────────────────────────────
      let rawVol = 0;
      if (!muted && analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        // Focus on voice range bins (roughly 80–800 Hz)
        const slice = data.slice(2, 20);
        rawVol = slice.reduce((s, v) => s + v, 0) / slice.length / 255;
      }

      // Smooth volume
      const target = muted ? 0 : rawVol;
      volRef.current += (target - volRef.current) * (muted ? 0.15 : 0.22);
      const vol = volRef.current;

      // Advance phase for wave animation
      phaseRef.current += muted ? 0.018 : 0.045 + vol * 0.08;
      const phase = phaseRef.current;

      // ── Background circle ───────────────────────────────
      if (muted) {
        // Muted: flat grey circle
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)';
        ctx.fill();
      } else {
        // Active: gradient fill that pulses with volume
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(99,102,241,${0.18 + vol * 0.28})`);
        grad.addColorStop(1, `rgba(167,139,250,${0.08 + vol * 0.12})`);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Outer ripple ring — grows with volume
        if (vol > 0.05) {
          const rippleR = r + 3 + vol * 14;
          ctx.beginPath();
          ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(129,140,248,${Math.max(0, 0.55 - vol * 0.2)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Second ripple for loud sounds
          if (vol > 0.35) {
            const ripple2 = r + 8 + vol * 22;
            ctx.beginPath();
            ctx.arc(cx, cy, ripple2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(167,139,250,${Math.max(0, 0.35 - vol * 0.15)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // ── Clip to circle ──────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // ── Wave bars (inside circle) ────────────────────────
      // 5 bars, centre-tallest, animated with sin wave
      const BAR_COUNT  = 5;
      const barW       = r * 0.18;
      const gapW       = r * 0.10;
      const totalW     = BAR_COUNT * barW + (BAR_COUNT - 1) * gapW;
      const startX     = cx - totalW / 2;
      const maxBarH    = r * (muted ? 0.12 : 0.72);

      // Centre-weight multipliers: shorter sides, tall centre
      const weights = [0.45, 0.72, 1.0, 0.72, 0.45];

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = startX + i * (barW + gapW);

        // Each bar has its own phase offset → wave effect
        const wave = Math.abs(Math.sin(phase + i * 0.9)) ;
        const barH = muted
          ? maxBarH                             // all same flat height when muted
          : maxBarH * weights[i] * (0.15 + wave * 0.85);

        const barX = x;
        const barY = cy - barH / 2;

        if (muted) {
          // Flat dots when muted
          ctx.beginPath();
          ctx.arc(barX + barW / 2, cy, barW / 2, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.2)';
          ctx.fill();
        } else {
          // Gradient bar
          const barGrad = ctx.createLinearGradient(0, barY, 0, barY + barH);
          barGrad.addColorStop(0,   `rgba(167,139,250,${0.6 + wave * 0.4})`);  // violet top
          barGrad.addColorStop(0.5, `rgba(99,102,241,${0.8 + wave * 0.2})`);   // indigo mid
          barGrad.addColorStop(1,   `rgba(167,139,250,${0.6 + wave * 0.4})`);  // violet bottom

          ctx.beginPath();
          ctx.roundRect(barX, barY, barW, barH, barW / 2);
          ctx.fillStyle = barGrad;
          ctx.fill();

          // Glow on loud bars
          if (wave > 0.6 && vol > 0.2) {
            ctx.shadowColor  = 'rgba(129,140,248,0.8)';
            ctx.shadowBlur   = 8 + wave * 10;
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW, barH, barW / 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      ctx.restore();

      // ── Border ring ─────────────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = muted
        ? isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.12)'
        : `rgba(129,140,248,${0.3 + vol * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (!muted) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        // Muted: still animate gently
        animRef.current = requestAnimationFrame(draw);
      }
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);
  };

  // ── Mic icon overlay ──────────────────────────────────────
  const iconSize = { sm: 14, md: 18, lg: 24 }[size];

  return (
    <div
      className="relative flex-shrink-0 select-none"
      style={{ width: D, height: D, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      title={isMuted ? 'Microphone muted' : 'Microphone active'}
    >
      <canvas
        ref={canvasRef}
        style={{ width: D, height: D, display: 'block', borderRadius: '50%' }}
      />
      {/* Mic icon centred on canvas */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ paddingBottom: 2 }}
      >
        {isMuted
          ? <MicOff size={iconSize} style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(99,102,241,0.4)' }} />
          : (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="13" rx="3"
                fill="url(#micGrad)" />
              <path d="M5 10a7 7 0 0 0 14 0" stroke="url(#micGrad)" strokeWidth="2"
                strokeLinecap="round" fill="none"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="url(#micGrad)"
                strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="micGrad" x1="9" y1="2" x2="15" y2="22"
                  gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#c4b5fd"/>
                  <stop offset="100%" stopColor="#818cf8"/>
                </linearGradient>
              </defs>
            </svg>
          )
        }
      </div>
    </div>
  );
}
