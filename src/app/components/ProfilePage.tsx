import { useState } from 'react';
import { ArrowLeft, Camera, User, Mail, Globe, Twitter, Linkedin, Save, Shield, Bell, Eye, Mic, Headphones, Scale, Check } from 'lucide-react';
import { User as UserType, Theme } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';

interface ProfilePageProps {
  user: UserType;
  currentTheme: Theme;
  onBack: () => void;
  onSave: (updatedUser: Partial<UserType>) => void;
}

const AVATAR_COLORS = [
  'linear-gradient(135deg, #3B5BF6, #7C3AED)',
  'linear-gradient(135deg, #F97316, #EF4444)',
  'linear-gradient(135deg, #10b981, #3B5BF6)',
  'linear-gradient(135deg, #7C3AED, #EC4899)',
  'linear-gradient(135deg, #F59E0B, #F97316)',
  'linear-gradient(135deg, #06b6d4, #3B5BF6)',
];

export function ProfilePage({ user, currentTheme, onBack, onSave }: ProfilePageProps) {
  const theme = themes[currentTheme];

  const [name, setName] = useState(user.name || 'Jordan Smith');
  const [bio, setBio] = useState('Introvert. Deep thinker. Passionate about meaningful conversations on tech, society, and the human condition.');
  const [location, setLocation] = useState('San Francisco, CA');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [preferredRole, setPreferredRole] = useState<'listener' | 'speaker' | 'debater'>('listener');
  const [notifyNew, setNotifyNew] = useState(true);
  const [notifyScheduled, setNotifyScheduled] = useState(true);
  const [profilePublic, setProfilePublic] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const roles = [
    { id: 'listener', label: 'Listener', desc: 'I prefer to absorb and learn', icon: Headphones, color: '#7C3AED' },
    { id: 'speaker', label: 'Speaker', desc: 'I love sharing ideas aloud', icon: Mic, color: '#3B5BF6' },
    { id: 'debater', label: 'Debater', desc: 'I thrive on structured debate', icon: Scale, color: '#F97316' },
  ] as const;

  return (
    <div
      className="min-h-screen bg-[#F4F6FB]"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#1A1A2E] font-bold text-sm hover:text-[#3B5BF6] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <h1 className="text-base font-black text-[#1A1A2E] tracking-tight">Edit Profile</h1>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white hover:scale-105 shadow-md hover:shadow-lg'
            }`}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Avatar Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
        >
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-5">Avatar</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl"
                style={{ background: AVATAR_COLORS[selectedColor] }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:border-[#3B5BF6] transition-colors">
                <Camera className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <p className="text-xs font-bold text-slate-500 mb-3">Choose avatar color</p>
              <div className="flex flex-wrap gap-3">
                {AVATAR_COLORS.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={`w-9 h-9 rounded-xl transition-all cursor-pointer ${selectedColor === i ? 'ring-2 ring-offset-2 ring-[#3B5BF6] scale-110' : 'hover:scale-105'}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5"
        >
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Personal Info</h2>

          {/* Display Name */}
          <div>
            <label className="text-xs font-extrabold text-[#1A1A2E] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#3B5BF6]" /> Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              className="w-full bg-[#F4F6FB] border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] placeholder:text-slate-400 outline-none focus:border-[#3B5BF6] focus:ring-2 focus:ring-[#3B5BF6]/10 transition-all"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-xs font-extrabold text-[#1A1A2E] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#7C3AED]" /> Email
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Read only</span>
            </label>
            <input
              type="email"
              value="jordan.smith@email.com"
              readOnly
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 outline-none cursor-not-allowed"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-extrabold text-[#1A1A2E] mb-1.5 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a little about yourself..."
              rows={3}
              className="w-full bg-[#F4F6FB] border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] placeholder:text-slate-400 outline-none focus:border-[#3B5BF6] focus:ring-2 focus:ring-[#3B5BF6]/10 transition-all resize-none"
            />
            <p className="text-right text-[11px] text-slate-400 mt-1">{bio.length}/200</p>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-extrabold text-[#1A1A2E] mb-1.5 block">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full bg-[#F4F6FB] border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] placeholder:text-slate-400 outline-none focus:border-[#3B5BF6] focus:ring-2 focus:ring-[#3B5BF6]/10 transition-all"
            />
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4"
        >
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Social Links</h2>
          {[
            { icon: Globe, label: 'Website', value: website, set: setWebsite, placeholder: 'https://yoursite.com', color: '#3B5BF6' },
            { icon: Twitter, label: 'Twitter / X', value: twitter, set: setTwitter, placeholder: '@handle', color: '#1DA1F2' },
            { icon: Linkedin, label: 'LinkedIn', value: linkedin, set: setLinkedin, placeholder: 'linkedin.com/in/you', color: '#0A66C2' },
          ].map(({ icon: Icon, label, value, set, placeholder, color }) => (
            <div key={label}>
              <label className="text-xs font-extrabold text-[#1A1A2E] mb-1.5 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color }} /> {label}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#F4F6FB] border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#1A1A2E] placeholder:text-slate-400 outline-none focus:border-[#3B5BF6] focus:ring-2 focus:ring-[#3B5BF6]/10 transition-all"
              />
            </div>
          ))}
        </motion.div>

        {/* Preferred Role */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
        >
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Preferred Discussion Role</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {roles.map(({ id, label, desc, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setPreferredRole(id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  preferredRole === id
                    ? 'border-[#3B5BF6] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-[#F4F6FB]'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-sm font-extrabold text-[#1A1A2E]">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                {preferredRole === id && (
                  <div className="mt-2 flex items-center gap-1 text-[#3B5BF6]">
                    <Check className="w-3 h-3" />
                    <span className="text-[11px] font-bold">Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4"
        >
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Preferences</h2>

          {[
            { icon: Bell, label: 'Notify me when new discussions go live', color: '#F97316', value: notifyNew, set: setNotifyNew },
            { icon: Bell, label: 'Notify me when a saved discussion starts', color: '#7C3AED', value: notifyScheduled, set: setNotifyScheduled },
            { icon: Eye, label: 'Make my profile public', color: '#3B5BF6', value: profilePublic, set: setProfilePublic },
          ].map(({ icon: Icon, label, color, value, set }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-sm font-semibold text-[#1A1A2E]">{label}</span>
              </div>
              <button
                onClick={() => set(!value)}
                className={`relative w-11 h-6 rounded-full transition-all cursor-pointer shrink-0 ${value ? 'bg-[#3B5BF6]' : 'bg-slate-200'}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`}
                />
              </button>
            </div>
          ))}
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4"
        >
          <Shield className="w-4 h-4 text-[#3B5BF6] mt-0.5 shrink-0" />
          <p className="text-xs text-[#3B5BF6] font-semibold leading-relaxed">
            Your anonymity is core to Duneli. Your display name is the only identity others see in discussions. Real names, emails, and social links are never shared publicly.
          </p>
        </motion.div>

        {/* Save Button (Bottom) */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl text-base font-extrabold transition-all shadow-lg cursor-pointer ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white hover:scale-[1.01] hover:shadow-xl'
          }`}
        >
          {saved ? 'Profile Saved!' : 'Save Changes'}
        </button>

        <div className="h-8" />
      </div>
    </div>
  );
}
