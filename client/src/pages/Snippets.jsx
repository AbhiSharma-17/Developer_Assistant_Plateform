import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  Code2, Plus, Search, Star, Copy, Check, Tag, Trash2, Edit, AlertCircle, CheckCircle2, Terminal
} from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Premium dark theme for Prism

export default function Snippets() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('All');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    title: '', language: 'JavaScript', code_content: '', tags: '', is_favorite: false
  });

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/snippets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnippets(data.snippets);
      } else {
        useFallback();
      }
    } catch (err) {
      console.error('Fetch snippets failed, using demo fallback', err);
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    setSnippets([
      { id: 1, title: 'Express.js Async Error Handler', language: 'JavaScript', code_content: 'const asyncHandler = fn => (req, res, next) =>\n  Promise.resolve(fn(req, res, next)).catch(next);\n\nexport default asyncHandler;', tags: 'express, middleware, async', is_favorite: true, created_at: '2026-05-18' },
      { id: 2, title: 'Python FastAPI DB Dependency', language: 'Python', code_content: 'from fastapi import Depends\nfrom sqlalchemy.orm import Session\n\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()', tags: 'fastapi, database, python', is_favorite: true, created_at: '2026-05-17' },
      { id: 3, title: 'Java Spring Boot CORS Config', language: 'Java', code_content: '@Configuration\npublic class CorsConfig implements WebMvcConfigurer {\n    @Override\n    public void addCorsMappings(CorsRegistry registry) {\n        registry.addMapping("/**").allowedOrigins("*");\n    }\n}', tags: 'spring, cors, java', is_favorite: false, created_at: '2026-05-16' },
      { id: 4, title: 'MySQL Optimized Pagination Query', language: 'SQL', code_content: 'SELECT id, title, created_at \nFROM articles \nWHERE id > 1000 \nORDER BY id ASC \nLIMIT 50;', tags: 'mysql, performance, sql', is_favorite: false, created_at: '2026-05-15' },
      { id: 5, title: 'C++ Binary Search Tree Node', language: 'C++', code_content: 'struct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n};', tags: 'cpp, algorithms, dsa', is_favorite: false, created_at: '2026-05-14' }
    ]);
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  // Trigger Prism highlighting whenever snippets or filters change
  useEffect(() => {
    if (!loading) {
      setTimeout(() => Prism.highlightAll(), 50);
    }
  }, [snippets, filterLanguage, filterFavorites, search, loading]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newSnippet.title || !newSnippet.code_content) return;
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/snippets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newSnippet)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnippets([data.snippet, ...snippets]);
        setSuccessMsg('Snippet saved successfully!');
      } else {
        const created = { id: Date.now(), ...newSnippet, created_at: 'Just now' };
        setSnippets([created, ...snippets]);
        setSuccessMsg('Snippet saved successfully (demo mode)!');
      }
    } catch (err) {
      const created = { id: Date.now(), ...newSnippet, created_at: 'Just now' };
      setSnippets([created, ...snippets]);
      setSuccessMsg('Snippet saved successfully (demo mode)!');
    }
    setNewSnippet({ title: '', language: 'JavaScript', code_content: '', tags: '', is_favorite: false });
    setShowAddModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleToggleFavorite = async (id) => {
    try {
      setSnippets(snippets.map(s => s.id === id ? { ...s, is_favorite: !s.is_favorite } : s));
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/snippets/${id}/favorite`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Toggle favorite error', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    try {
      setSnippets(snippets.filter(s => s.id !== id));
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/snippets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Snippet deleted successfully!');
    } catch (err) {
      setSuccessMsg('Snippet deleted successfully (demo mode)!');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.tags?.toLowerCase().includes(search.toLowerCase());
    const matchesLang = filterLanguage === 'All' || s.language.toLowerCase() === filterLanguage.toLowerCase();
    const matchesFav = !filterFavorites || s.is_favorite;
    return matchesSearch && matchesLang && matchesFav;
  });

  const languages = ['All', 'JavaScript', 'Python', 'Java', 'SQL', 'C++'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <Code2 className="h-8 w-8 text-amber-400" />
            <span>Code Snippet Manager</span>
          </h1>
          <p className="text-slate-400 text-sm">Save, organize, search, and copy reusable code blocks with full Prism.js syntax highlighting.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 shadow-lg shadow-amber-500/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Save Snippet</span>
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
            placeholder="Search snippets by title, tags..."
            className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900/60 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all backdrop-blur-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterFavorites 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10' 
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <Star className={`h-4 w-4 ${filterFavorites ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            <span>Favorites</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setFilterLanguage(lang)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterLanguage === lang
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Snippets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredSnippets.map((snippet) => {
          // Map language to prism class
          const langClass = `language-${snippet.language.toLowerCase() === 'c++' ? 'cpp' : snippet.language.toLowerCase()}`;
          return (
            <div key={snippet.id} className="glass-panel rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between group relative overflow-hidden shadow-xl hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-900 text-amber-400 border border-slate-800 tracking-wider">
                      {snippet.language}
                    </span>
                    {snippet.tags && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                        <Tag className="h-3 w-3 text-slate-600" />
                        <span>{snippet.tags}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(snippet.id)}
                      className="p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 transition-colors"
                      title={snippet.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={`h-4 w-4 ${snippet.is_favorite ? 'fill-amber-400 text-amber-400' : 'hover:text-amber-400'}`} />
                    </button>
                    <button
                      onClick={() => handleCopy(snippet.id, snippet.code_content)}
                      className="p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-blue-400 transition-colors relative"
                      title="Copy code"
                    >
                      {copiedId === snippet.id ? <Check className="h-4 w-4 text-emerald-400 animate-scaleIn" /> : <Copy className="h-4 w-4" />}
                      {copiedId === snippet.id && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold shadow-lg animate-fadeIn">
                          Copied!
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className="p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete snippet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                  {snippet.title}
                </h3>

                {/* Code Block with Prism.js */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-[#1d1f27] my-4 shadow-inner max-h-80 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#14151a] border-b border-slate-800 text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="h-3 w-3 text-amber-500/80" />
                      <span>{snippet.language} snippet</span>
                    </div>
                    <span>{snippet.code_content.split('\n').length} lines</span>
                  </div>
                  <pre className="!m-0 !p-4 !bg-transparent text-xs font-mono">
                    <code className={langClass}>
                      {snippet.code_content}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                <span>ID: #{snippet.id}</span>
                <span>Added: {snippet.created_at || 'Recent'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Snippet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-8 max-w-xl w-full border border-slate-700/80 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Save Code Snippet</h2>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Snippet Title</label>
                <input
                  type="text"
                  required
                  value={newSnippet.title}
                  onChange={(e) => setNewSnippet({...newSnippet, title: e.target.value})}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. MongoDB Connection Helper"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Programming Language</label>
                  <select
                    value={newSnippet.language}
                    onChange={(e) => setNewSnippet({...newSnippet, language: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="SQL">SQL</option>
                    <option value="C++">C++</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newSnippet.tags}
                    onChange={(e) => setNewSnippet({...newSnippet, tags: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                    placeholder="database, config, helper..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Code Content</label>
                <textarea
                  required
                  rows={8}
                  value={newSnippet.code_content}
                  onChange={(e) => setNewSnippet({...newSnippet, code_content: e.target.value})}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 p-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none custom-scrollbar"
                  placeholder="Paste your reusable code here..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={newSnippet.is_favorite}
                    onChange={(e) => setNewSnippet({...newSnippet, is_favorite: e.target.checked})}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <span>Add to Favorites</span>
                </label>

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
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    Save Snippet
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
