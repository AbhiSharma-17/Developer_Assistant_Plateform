import React, { useState } from 'react';
import { Terminal, Lock, Mail, ArrowRight, Sparkles, GitBranch, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex@devos.io');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Server error during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0f19] relative overflow-hidden px-4 py-12">
      {/* Ambient glowing background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 shadow-xl shadow-purple-500/30 mb-6">
            <Terminal className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
            Welcome to DEV<span className="text-purple-400">OS</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            The ultimate AI-powered Developer Assistant Platform. Manage projects, tasks, snippets, and prompts in one place.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-slate-700/50">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />
          
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-shake">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Developer Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="you@company.dev"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500" />
                <span>Remember session</span>
              </label>
              <a href="#forgot" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-3 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Access Developer Platform'}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-4 text-xs text-slate-500 uppercase tracking-widest font-semibold rounded-full py-1 border border-slate-800">
              Or Continue With
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => login('alex@devos.io', 'password123')}
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-slate-700/80 bg-slate-950/40 text-slate-300 text-sm font-medium hover:bg-slate-800/50 transition-all"
            >
              <GitBranch className="h-4 w-4" />
              <span>Demo Login</span>
            </button>
            <button
              type="button"
              onClick={() => login('alex@devos.io', 'password123')}
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-slate-700/80 bg-slate-950/40 text-slate-300 text-sm font-medium hover:bg-slate-800/50 transition-all"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>SSO Login</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800/60">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold underline transition-colors">
              Create DevOS Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
