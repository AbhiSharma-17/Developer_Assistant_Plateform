import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Search, Star, Copy, Check, Tag, Trash2, Globe, Lock, CheckCircle2, MessageSquare, X
} from 'lucide-react';

export default function PromptVault() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterVisibility, setFilterVisibility] = useState('All'); // All, Public, Private
  const [copiedId, setCopiedId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    title: '', category: 'Coding', prompt_text: '', tags: '', is_favorite: false, is_public: true
  });

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/prompts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPrompts(data.prompts);
      } else {
        useFallback();
      }
    } catch (err) {
      console.error('Fetch prompts failed, using demo fallback', err);
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    setPrompts([
      { id: 1, title: 'Senior Code Reviewer & Refactorer', category: 'Coding', prompt_text: 'Act as an elite Senior Full-Stack Software Engineer. Review the following code snippet for security vulnerabilities, time/space complexity bottlenecks, and clean code principles. Provide a refactored version with robust comments explaining your architectural decisions.', tags: 'codereview, refactor, clean-code', is_favorite: true, is_public: true, created_at: '2026-05-18' },
      { id: 2, title: 'Advanced MySQL Query Optimizer', category: 'SQL', prompt_text: 'Analyze the following SQL query and schema. Identify missing composite indexes, subquery bottlenecks, and potential deadlocks. Rewrite the query using JOINs or window functions for maximum performance on a table with 10M+ rows.', tags: 'mysql, indexing, performance', is_favorite: true, is_public: true, created_at: '2026-05-17' },
      { id: 3, title: 'Tailwind CSS v4 Glassmorphism Theme', category: 'UI Design', prompt_text: 'Generate a modern, premium dark mode UI component using Tailwind CSS v4. Incorporate glassmorphism utilities (backdrop-blur, border-slate-800/80), smooth HSL gradients, and subtle micro-animations. Ensure perfect mobile responsiveness.', tags: 'tailwind, ui, darkmode, glassmorphism', is_favorite: false, is_public: true, created_at: '2026-05-16' },
      { id: 4, title: 'GitHub Actions CI/CD Docker Pipeline', category: 'Automation', prompt_text: 'Create a complete GitHub Actions workflow YAML file for a multi-stage Docker build. Include caching for npm dependencies, parallel linting/testing jobs, and automated push to AWS ECR upon successful merge to the main branch.', tags: 'cicd, docker, devops, github-actions', is_favorite: false, is_public: false, created_at: '2026-05-15' },
      { id: 5, title: 'REST API OpenAPI 3.0 Specification', category: 'Documentation', prompt_text: 'Draft a comprehensive OpenAPI 3.0 YAML specification for an enterprise authentication and user management service. Include request/response schemas for /register, /login, and /me, along with JWT security definitions and standard error codes (400, 401, 403, 500).', tags: 'openapi, swagger, api, docs', is_favorite: false, is_public: true, created_at: '2026-05-14' }
    ]);
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newPrompt.title || !newPrompt.prompt_text) return;
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newPrompt)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPrompts([data.prompt, ...prompts]);
        setSuccessMsg('Prompt saved successfully!');
      } else {
        const created = { id: Date.now(), ...newPrompt, created_at: 'Just now' };
        setPrompts([created, ...prompts]);
        setSuccessMsg('Prompt saved successfully (demo mode)!');
      }
    } catch (err) {
      const created = { id: Date.now(), ...newPrompt, created_at: 'Just now' };
      setPrompts([created, ...prompts]);
      setSuccessMsg('Prompt saved successfully (demo mode)!');
    }
    setNewPrompt({ title: '', category: 'Coding', prompt_text: '', tags: '', is_favorite: false, is_public: true });
    setShowAddModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleToggleFavorite = async (id) => {
    try {
      setPrompts(prompts.map(p => p.id === id ? { ...p, is_favorite: !p.is_favorite } : p));
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/prompts/${id}/favorite`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Toggle favorite error', err);
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      setPrompts(prompts.map(p => p.id === id ? { ...p, is_public: !p.is_public } : p));
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/prompts/${id}/visibility`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Toggle visibility error', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    setPrompts(prev => prev.filter(p => p.id !== id));
    try {
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/prompts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Prompt deleted successfully!');
    } catch (err) {
      setSuccessMsg('Prompt deleted (demo mode)!');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.prompt_text.toLowerCase().includes(search.toLowerCase()) || p.tags?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'All' || p.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesFav = !filterFavorites || p.is_favorite;
    const matchesVis = filterVisibility === 'All' || (filterVisibility === 'Public' && p.is_public) || (filterVisibility === 'Private' && !p.is_public);
    return matchesSearch && matchesCat && matchesFav && matchesVis;
  });

  const categories = ['All', 'Coding', 'SQL', 'UI Design', 'Automation', 'Documentation'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span>AI Prompt Vault</span>
          </h1>
          <p className="text-slate-400 text-sm">Curate, categorize, search, and execute high-utility system prompts and context templates.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 shadow-lg shadow-purple-500/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Save Prompt</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold animate-scaleIn">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts by title, text, tags..."
            className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900/60 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all backdrop-blur-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Favorites Toggle */}
          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterFavorites 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10' 
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <Star className={`h-4 w-4 ${filterFavorites ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            <span>Favorites</span>
          </button>

          {/* Visibility Toggle */}
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-xs font-semibold text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer backdrop-blur-sm"
          >
            <option value="All">All Visibility</option>
            <option value="Public">Public Only</option>
            <option value="Private">Private Only</option>
          </select>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Categories */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterCategory === cat
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPrompts.map((prompt) => (
          <div key={prompt.id} className="glass-panel rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between group relative overflow-hidden shadow-xl hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                    prompt.category === 'Coding' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    prompt.category === 'SQL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    prompt.category === 'UI Design' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                    prompt.category === 'Automation' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {prompt.category}
                  </span>
                  
                  <button
                    onClick={() => handleToggleVisibility(prompt.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                      prompt.is_public 
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={prompt.is_public ? "Click to make Private" : "Click to make Public"}
                  >
                    {prompt.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    <span>{prompt.is_public ? 'Public' : 'Private'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(prompt.id)}
                    className="p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 transition-colors"
                    title={prompt.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={`h-4 w-4 ${prompt.is_favorite ? 'fill-amber-400 text-amber-400' : 'hover:text-amber-400'}`} />
                  </button>
                  <button
                    onClick={() => handleCopy(prompt.id, prompt.prompt_text)}
                    className="p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-purple-400 transition-colors relative"
                    title="Copy prompt text"
                  >
                    {copiedId === prompt.id ? <Check className="h-4 w-4 text-emerald-400 animate-scaleIn" /> : <Copy className="h-4 w-4" />}
                    {copiedId === prompt.id && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold shadow-lg animate-fadeIn">
                        Copied!
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete prompt"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                {prompt.title}
              </h3>

              {/* Prompt Text Container */}
              <div className="bg-[#121318]/80 rounded-2xl p-4 border border-slate-800/80 my-4 text-xs font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar shadow-inner relative group/box">
                <div className="absolute top-2 right-2 opacity-0 group-hover/box:opacity-100 transition-opacity">
                  <MessageSquare className="h-4 w-4 text-slate-600" />
                </div>
                {prompt.prompt_text}
              </div>

              {prompt.tags && (
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {prompt.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-[10px] bg-slate-900/80 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
                      <Tag className="h-2.5 w-2.5 text-purple-400" />
                      <span>{tag.trim()}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
              <span>ID: #{prompt.id}</span>
              <span>Saved: {prompt.created_at || 'Recent'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-8 max-w-xl w-full border border-slate-700/80 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Save AI Prompt Template</h2>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Prompt Title</label>
                <input
                  type="text"
                  required
                  value={newPrompt.title}
                  onChange={(e) => setNewPrompt({...newPrompt, title: e.target.value})}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g. Advanced System Refactoring Agent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Category</label>
                  <select
                    value={newPrompt.category}
                    onChange={(e) => setNewPrompt({...newPrompt, category: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Coding">Coding</option>
                    <option value="SQL">SQL</option>
                    <option value="UI Design">UI Design</option>
                    <option value="Automation">Automation</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newPrompt.tags}
                    onChange={(e) => setNewPrompt({...newPrompt, tags: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                    placeholder="refactor, clean-code, dsa..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Prompt Text / Context Template</label>
                <textarea
                  required
                  rows={6}
                  value={newPrompt.prompt_text}
                  onChange={(e) => setNewPrompt({...newPrompt, prompt_text: e.target.value})}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 p-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none custom-scrollbar"
                  placeholder="Act as a Senior Software Engineer. Analyze the following..."
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={newPrompt.is_favorite}
                      onChange={(e) => setNewPrompt({...newPrompt, is_favorite: e.target.checked})}
                      className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Add to Favorites</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={newPrompt.is_public}
                      onChange={(e) => setNewPrompt({...newPrompt, is_public: e.target.checked})}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      {newPrompt.is_public ? <Globe className="h-3 w-3 text-emerald-400" /> : <Lock className="h-3 w-3 text-slate-400" />}
                      <span>{newPrompt.is_public ? 'Make Public' : 'Keep Private'}</span>
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-purple-500/25 transition-all"
                  >
                    Save Prompt
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
