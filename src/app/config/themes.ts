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
