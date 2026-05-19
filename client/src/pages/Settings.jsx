import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Eye, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [successMsg, setSuccessMsg] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name || 'Alex Mercer',
    email: user?.email || 'alex@devos.io',
    role: user?.role || 'Senior Full-Stack Engineer',
    bio: 'Passionate about distributed systems, AI copilot tooling, and clean architecture.',
  });

  const [aiConfig, setAiConfig] = useState({
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096,
    autoSuggest: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-slate-400 animate-spin-slow" />
          <span>System Settings & Preferences</span>
        </h1>
        <p className="text-slate-400 text-sm">Configure your developer profile, AI copilot parameters, API keys, and notification rules.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold animate-scaleIn">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs & Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="glass-panel rounded-3xl p-4 border border-slate-800 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible h-fit">
          {[
            { id: 'profile', label: 'Developer Profile', icon: User },
            { id: 'ai', label: 'AI Copilot Engine', icon: Key },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security & Auth', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap w-full ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border-l-4 border-purple-500 shadow-md shadow-purple-500/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-8 border border-slate-800">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-slate-800">Developer Profile Configuration</h2>

              <div className="flex items-center gap-6 pb-6 border-b border-slate-800/60">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="Avatar"
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                />
                <div>
                  <h3 className="text-base font-semibold text-white mb-1.5">Profile Avatar</h3>
                  <p className="text-xs text-slate-400 mb-3">PNG, JPG or GIF up to 10MB. Synced with Gravatar.</p>
                  <button type="button" className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Job Title / Role</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({...profile, role: e.target.value})}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Developer Bio</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-purple-500/25 transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'ai' && (
            <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-slate-800">AI Copilot Parameters</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Default AI Model</label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({...aiConfig, model: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="gpt-4o">GPT-4o (High Intelligence)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Best for Code)</option>
                    <option value="gemini-1-5-pro">Gemini 1.5 Pro (Large Context)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Max Output Tokens</label>
                  <input
                    type="number"
                    value={aiConfig.maxTokens}
                    onChange={(e) => setAiConfig({...aiConfig, maxTokens: parseInt(e.target.value)})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Creativity Temperature: {aiConfig.temperature}</label>
                  <span className="text-xs text-slate-500 font-mono">0.0 (Precise) - 1.0 (Creative)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={aiConfig.temperature}
                  onChange={(e) => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
                  className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Real-time Inline Suggestions</h3>
                  <p className="text-xs text-slate-500">Allow Copilot to suggest refactors and optimizations as you type.</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiConfig.autoSuggest}
                  onChange={(e) => setAiConfig({...aiConfig, autoSuggest: e.target.checked})}
                  className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 h-5 w-5 cursor-pointer"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-purple-500/25 transition-all">
                  Save AI Parameters
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-slate-800">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { title: 'Sprint Task Assignments', desc: 'Notify when a new sprint task is assigned to you.' },
                  { title: 'CI/CD Pipeline Alerts', desc: 'Instant alerts on GitHub Actions build failures or deployment success.' },
                  { title: 'AI Copilot Weekly Digest', desc: 'Receive a weekly summary of AI optimizations and time saved.' },
                  { title: 'Security Vulnerability Alerts', desc: 'Immediate notification if a saved snippet contains deprecated dependencies.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">{item.title}</h3>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 h-5 w-5 cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-slate-800">Security & Authentication</h2>
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h3 className="text-base font-semibold text-slate-200">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Protect your developer account with TOTP authenticator apps (e.g., Google Authenticator, Authy).
                </p>
                <button className="px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all">
                  Enable Two-Factor Authentication
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h3 className="text-base font-semibold text-slate-200">Active Sessions</h3>
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="font-semibold text-slate-200">Windows • Chrome 135.0</div>
                    <div className="text-slate-500 mt-0.5">IP: 192.168.1.42 • Active Now</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Current Session
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
