import { Headphones, Mic, Scale, ArrowLeft, Loader } from 'lucide-react';
import { Theme, Role, Discussion } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RoleSelectionPageProps {
  discussion: Discussion;
  currentTheme: Theme;
  onSelectRole: (role: Role) => void;
  onBack: () => void;
}

export function RoleSelectionPage({ discussion, currentTheme, onSelectRole, onBack }: RoleSelectionPageProps) {

  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) { setCheckingRole(false); return; }
        const res = await fetch(`${API_URL}/api/discussions/${discussion.id}/my-role`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const d = await res.json();
          if (d.role) { onSelectRole(d.role as Role); return; }
        }
      } catch { }
      setCheckingRole(false);
    };
    check();
  }, [discussion.id]);

  if (checkingRole) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7ff' }}>
      <Loader className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  const roles = [
    {
      id: 'listener' as Role,
      icon: Headphones,
      emoji: '🎧',
      title: 'Listener',
      subtitle: 'Only Able to Listen',
      grad: 'linear-gradient(135deg, #7C3AED, #a855f7)',
      btn: 'linear-gradient(135deg, #7C3AED, #a855f7)',
      glow: 'rgba(124,58,237,0.15)',
      border: '#c4b5fd',
      perms: ['Mic locked OFF — zero pressure', 'Silent spectator mode', 'React to ideas 👍 / 👎', 'Raise hand to request speaking'],
    },
    {
      id: 'speaker' as Role,
      icon: Mic,
      emoji: '🎙️',
      title: 'Speaker',
      subtitle: 'Speaks On Their Turn',
      grad: 'linear-gradient(135deg, #3B5BF6, #6366f1)',
      btn: 'linear-gradient(135deg, #3B5BF6, #6366f1)',
      glow: 'rgba(59,91,246,0.15)',
      border: '#a5b4fc',
      perms: ['Queue-based speaking turns', '3-minute live timer per turn', 'Auto-muted when turn ends', 'Return to Listener after'],
    },
    {
      id: 'debater' as Role,
      icon: Scale,
      emoji: '⚡',
      title: 'Debater',
      subtitle: 'Speaks Anytime',
      grad: 'linear-gradient(135deg, #F97316, #ef4444)',
      btn: 'linear-gradient(135deg, #F97316, #ef4444)',
      glow: 'rgba(249,115,22,0.15)',
      border: '#fdba74',
      perms: ['Open mic — speak anytime', 'Mute / unmute freely', 'No turn limits or queues', 'Active real-time debate'],
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(160deg,#f8f7ff 0%,#eef2ff 50%,#faf5ff 100%)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* Blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)', transform: 'translate(20%,-20%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(59,91,246,0.10),transparent 70%)', transform: 'translate(-20%,20%)' }} />

      {/* Back */}
      <div className="px-6 pt-4 shrink-0">
        <button onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#1A1A2E]/70 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:scale-105 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </button>
      </div>

      {/* Header */}
      <div className="text-center px-4 pt-3 pb-2 shrink-0">
        <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A2E] mb-2" style={{ letterSpacing: '-0.02em' }}>
          How would you like to join?
        </h1>
        {/* Discussion pill */}
        <div className="inline-flex items-center gap-3 bg-white border border-blue-100 shadow px-5 py-2 rounded-2xl text-sm text-[#1A1A2E]/70 font-medium">
          <span className="font-bold text-[#1A1A2E]">{discussion.title}</span>
          <span className="text-gray-300">·</span>
          <span>{discussion.category}</span>
          <span className="text-gray-300">·</span>
          <span>{discussion.listenerCount || 0} listening</span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 grid grid-cols-3 gap-4 px-6 pb-5 min-h-0">
        {roles.map((role, i) => (
          <motion.div key={role.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="flex flex-col rounded-3xl overflow-hidden h-full"
            style={{ background: '#fff', border: `1.5px solid ${role.border}`, boxShadow: `0 4px 24px ${role.glow}` }}>

            {/* Top accent line */}
            <div className="h-1 w-full shrink-0" style={{ background: role.grad }} />

            <div className="flex flex-col flex-1 p-5 min-h-0">
              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-3 shrink-0">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                  style={{ background: role.grad }}>
                  <role.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1A1A2E] leading-tight">
                    {role.title} {role.emoji}
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-[#1A1A2E]/60">
                    {role.subtitle}
                  </span>
                </div>
              </div>

              {/* Permissions */}
              <div className="flex-1 space-y-2 min-h-0 overflow-hidden">
                {role.perms.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 font-bold text-sm shrink-0 mt-0.5">✓</span>
                    <span className="text-xs text-[#1A1A2E]/65 leading-snug font-medium">{p}</span>
                  </div>
                ))}
              </div>

              {/* Button — always at bottom */}
              <button onClick={() => onSelectRole(role.id)}
                className="mt-auto pt-4 w-full py-3 rounded-2xl text-sm font-extrabold text-white shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
                style={{ background: role.btn }}>
                Select {role.title} {role.emoji}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-[#1A1A2E]/35 pb-3 shrink-0 font-medium">
        You can change your role or leave at any time.
      </p>
    </div>
  );
}
