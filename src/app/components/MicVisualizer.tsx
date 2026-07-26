import { useEffect, useRef } from 'react';
import { MicOff } from 'lucide-react';

interface Props {
  isMuted: boolean;
  isDark: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function MicVisualizer({ isMuted, isDark, size = 'md', onClick }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const acRef       = useRef<AudioContext | null>(null);
  const animRef     = useRef<number>(0);
  const volRef      = useRef(0);   // smoothed 0–1
  const phaseRef    = useRef(0);   // only advances when speaking

  const D = { sm: 52, md: 72, lg: 100 }[size];
  const iconSize = { sm: 14, md: 18, lg: 24 }[size];

  useEffect(() => {
    let alive = true;

    const cleanup = () => {
      cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      acRef.current?.close().catch(() => {});
      streamRef.current = null;
      acRef.current = null;
      analyserRef.current = null;
    };

    if (isMuted) {
      cleanup();
      volRef.current = 0;
      // draw once — flat state
      drawFrame(true);
      return cleanup;
    }

    const boot = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!alive) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const ac = new AudioContext();
        acRef.current = ac;
        const an = ac.createAnalyser();
        an.fftSize = 256;
        an.smoothingTimeConstant = 0.8;
        analyserRef.current = an;
        ac.createMediaStreamSource(stream).connect(an);
      } catch { /* no mic — idle */ }

      loop();
    };

    const loop = () => {
      cancelAnimationFrame(animRef.current);
      const tick = () => {
        drawFrame(false);
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    };

    boot();
    return () => { alive = false; cleanup(); };
  }, [isMuted]);

  const drawFrame = (muted: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const r  = Math.min(W, H) / 2 - 2;

    // ── Get raw volume from mic ──────────────────────────────
    let rawVol = 0;
    if (!muted && analyserRef.current) {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      const slice = data.slice(2, 22); // voice range
      rawVol = slice.reduce((s, v) => s + v, 0) / slice.length / 255;
    }

    // Smooth volume
    const alpha = rawVol > volRef.current ? 0.35 : 0.12; // fast rise, slow fall
    volRef.current += (rawVol - volRef.current) * alpha;
    const vol = muted ? 0 : volRef.current;

    // ── Phase ONLY advances when there is actual voice ───────
    // Below threshold → phase stays frozen → bars stay still
    const THRESHOLD = 0.04;
    if (vol > THRESHOLD) {
      phaseRef.current += 0.08 + vol * 0.14; // faster wave when louder
    }
    const phase = phaseRef.current;

    // ── Background circle ────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (muted) {
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.07)';
    } else {
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      bg.addColorStop(0, `rgba(99,102,241,${0.12 + vol * 0.22})`);
      bg.addColorStop(1, `rgba(167,139,250,${0.05 + vol * 0.1})`);
      ctx.fillStyle = bg;
    }
    ctx.fill();

    // ── Ripple rings — only when speaking ────────────────────
    if (!muted && vol > THRESHOLD) {
      // Ring 1
      ctx.beginPath();
      ctx.arc(cx, cy, r + 3 + vol * 12, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(129,140,248,${0.55 - vol * 0.15})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ring 2 — only on louder speech
      if (vol > 0.3) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + 9 + vol * 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(167,139,250,${0.3 - vol * 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // ── Clip to circle ───────────────────────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // ── 5 bars ───────────────────────────────────────────────
    const BAR_COUNT = 5;
    const barW  = r * 0.18;
    const gapW  = r * 0.10;
    const total = BAR_COUNT * barW + (BAR_COUNT - 1) * gapW;
    const sx    = cx - total / 2;
    const weights = [0.45, 0.72, 1.0, 0.72, 0.45];
    // Base resting height (bars are never completely flat when unmuted)
    const REST_H = r * 0.12;
    const MAX_H  = r * 0.72;

    for (let i = 0; i < BAR_COUNT; i++) {
      const x = sx + i * (barW + gapW);

      let barH: number;
      if (muted) {
        // Muted: all bars = tiny dots
        barH = barW;
      } else if (vol <= THRESHOLD) {
        // Silent but unmuted: bars sit at resting height, no movement
        barH = REST_H * weights[i];
      } else {
        // Speaking: wave driven by actual volume
        const wave = Math.abs(Math.sin(phase + i * 1.1));
        barH = REST_H * weights[i] + (MAX_H * weights[i] - REST_H * weights[i]) * wave * Math.min(vol * 2.5, 1);
      }

      const bx = x;
      const by = cy - barH / 2;

      if (muted) {
        // Flat dot
        ctx.beginPath();
        ctx.arc(bx + barW / 2, cy, barW / 2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(99,102,241,0.2)';
        ctx.fill();
      } else {
        const wave = vol > THRESHOLD ? Math.abs(Math.sin(phase + i * 1.1)) : 0;
        const g = ctx.createLinearGradient(0, by, 0, by + barH);
        g.addColorStop(0,   `rgba(196,181,253,${0.7 + wave * 0.3})`); // violet-300
        g.addColorStop(0.5, `rgba(99,102,241,${0.85 + wave * 0.15})`); // indigo-500
        g.addColorStop(1,   `rgba(196,181,253,${0.7 + wave * 0.3})`); // violet-300

        ctx.beginPath();
        ctx.roundRect(bx, by, barW, barH, barW / 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Glow only when loud
        if (vol > 0.25 && wave > 0.55) {
          ctx.shadowColor = 'rgba(129,140,248,0.9)';
          ctx.shadowBlur  = 6 + wave * 10;
          ctx.beginPath();
          ctx.roundRect(bx, by, barW, barH, barW / 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    ctx.restore();

    // ── Border ───────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = muted
      ? isDark ? 'rgba(255,255,255,0.09)' : 'rgba(99,102,241,0.12)'
      : `rgba(129,140,248,${0.25 + vol * 0.55})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

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
      {/* Mic icon centred */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isMuted ? (
          <MicOff size={iconSize}
            style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(99,102,241,0.38)' }} />
        ) : (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="mg" x1="9" y1="2" x2="15" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#c4b5fd"/>
                <stop offset="100%" stopColor="#818cf8"/>
              </linearGradient>
            </defs>
            <rect x="9" y="2" width="6" height="13" rx="3" fill="url(#mg)"/>
            <path d="M5 10a7 7 0 0 0 14 0" stroke="url(#mg)" strokeWidth="2"
              strokeLinecap="round" fill="none"/>
            <line x1="12" y1="19" x2="12" y2="22" stroke="url(#mg)"
              strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}
