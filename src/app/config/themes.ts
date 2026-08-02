import { Theme } from '../types';

export interface ThemeConfig {
  name: string;
  background: string;
  cardStyle: string;
  accentColor: string;
  buttonClass: string;
  textColor: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  futuristic: {
    name: 'Nova Futuristic',
    background: 'radial-gradient(circle at 20% 0%, #0a1128 0%, #05060a 45%, #05060a 100%)',
    cardStyle: 'nova-glass nova-glow-border rounded-3xl',
    accentColor: '#4bf5ff',
    buttonClass: 'bg-gradient-to-r from-[#4bf5ff] to-[#4f7dff] hover:from-[#6bf9ff] hover:to-[#6f93ff] text-[#05060a] font-semibold shadow-[0_0_30px_rgba(75,245,255,0.35)]',
    textColor: 'text-[#eef2ff]',
  },
  duneli: {
    name: 'Duneli Brand',
    background: 'linear-gradient(160deg, #f8f7ff 0%, #eef2ff 40%, #f0f7ff 70%, #faf5ff 100%)',
    cardStyle: 'bg-white/80 backdrop-blur-xl border border-blue-100/70 shadow-lg shadow-blue-50',
    accentColor: '#3B5BF6',
    buttonClass: 'bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] hover:from-[#2a47e8] hover:to-[#6d28d9] text-white shadow-lg shadow-blue-200',
    textColor: 'text-[#1A1A2E]',
  },
  dream: {
    name: 'Dream Spectrum',
    background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 25%, #fad0c4 50%, #ffd1ff 75%, #c1dfc4 100%)',
    cardStyle: 'backdrop-blur-lg bg-white/25 border border-white/40 shadow-lg',
    accentColor: '#ec4899',
    buttonClass: 'bg-pink-500 hover:bg-pink-600 text-white',
    textColor: 'text-gray-900',
  },
  aurora: {
    name: 'Aurora Dark',
    background: 'linear-gradient(135deg, #0B0F1A 0%, #1A1033 50%, #24103F 100%)',
    cardStyle: 'backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg',
    accentColor: '#c084fc',
    buttonClass: 'bg-purple-500 hover:bg-purple-600 text-white',
    textColor: 'text-white',
  },
  mist: {
    name: 'Mist Glass',
    background: 'linear-gradient(135deg, #667eea 0%, #84a9c8 100%)',
    cardStyle: 'backdrop-blur-xl bg-white/20 border border-white/30 shadow-lg',
    accentColor: '#60a5fa',
    buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
    textColor: 'text-gray-900',
  },
  mint: {
    name: 'Mint Calm',
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    cardStyle: 'bg-white border border-gray-200 shadow-md',
    accentColor: '#14b8a6',
    buttonClass: 'bg-teal-500 hover:bg-teal-600 text-white',
    textColor: 'text-gray-900',
  },
};
