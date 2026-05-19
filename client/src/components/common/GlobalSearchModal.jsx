import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, FolderKanban, CheckSquare, FileText, Code2, Sparkles, X, 
  ArrowRight, Command, Loader2
} from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const filters = ['All', 'Projects', 'Tasks', 'Notes', 'Snippets', 'Prompts'];

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeFilter, isOpen]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}&filter=${activeFilter.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResults(data.results);
      } else {
        useFallbackSearch();
      }
    } catch (err) {
      useFallbackSearch();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackSearch = () => {
    const mockAll = [
      { id: 1, title: 'DevOS System Architecture v1', preview: '# DevOS System Architecture\nWelcome to the official documentation for DevOS...', type: 'note', meta: 'Architecture', url: '/notes' },
      { id: 2, title: 'Implement OAuth2 Flow with GitHub', preview: 'Setup passport.js or manual OAuth2 token exchange with GitHub REST API', type: 'task', meta: 'Pending', url: '/tasks' },
      { id: 3, title: 'GraphQL API Gateway', preview: 'Apollo Federation v2 gateway with automated Redis caching and JWT authentication.', type: 'project', meta: 'In Progress', url: '/projects' },
      { id: 4, title: 'Express JWT Authentication Middleware', preview: 'const protect = async (req, res, next) => { const token = req.headers.authorization?.split(" ")[1]; ... }', type: 'snippet', meta: 'JavaScript', url: '/snippets' },
      { id: 5, title: 'System Architect Persona Prompt', preview: 'You are an elite Enterprise System Architect. Design highly scalable, fault-tolerant microservices...', type: 'prompt', meta: 'Coding', url: '/prompts' }
    ];

    const filtered = mockAll.filter(item => {
      const matchesQ = item.title.toLowerCase().includes(query.toLowerCase()) || item.preview.toLowerCase().includes(query.toLowerCase());
      const matchesF = activeFilter === 'All' || item.type === activeFilter.toLowerCase().replace('s', '');
      return matchesQ && matchesF;
    });

    setResults(filtered);
  };

  const handleSelectResult = (url) => {
    navigate(url);
    onClose();
  };

  const highlightMatch = (text, q) => {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={idx} className="bg-purple-500/30 text-purple-200 font-extrabold rounded px-1 border border-purple-500/40 shadow-sm">
          {part}
        </mark>
      ) : part
    );
  };

  const getIcon = (type) => {
    switch(type) {
      case 'project': return <FolderKanban className="h-4 w-4 text-blue-400" />;
      case 'task': return <CheckSquare className="h-4 w-4 text-emerald-400" />;
      case 'note': return <FileText className="h-4 w-4 text-amber-400" />;
      case 'snippet': return <Code2 className="h-4 w-4 text-purple-400" />;
      case 'prompt': return <Sparkles className="h-4 w-4 text-pink-400" />;
      default: return <Search className="h-4 w-4 text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-20 animate-fadeIn">
      <div className="glass-panel rounded-3xl w-full max-w-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-800 bg-slate-950/60 p-4 flex items-center gap-3">
          <Search className="h-5 w-5 text-purple-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks, notes, snippets, prompts..."
            className="flex-1 bg-transparent text-sm font-bold text-white placeholder-slate-500 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 text-purple-400 animate-spin flex-shrink-0" />}
          <button 
            onClick={onClose} 
            className="p-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto custom-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                activeFilter === f
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {!query.trim() ? (
            <div className="py-16 text-center text-slate-600 text-xs font-medium space-y-3">
              <Command className="h-10 w-10 text-slate-700 mx-auto animate-pulse" />
              <div>Type a query above to search instantly across your entire DevOS workspace.</div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-slate-600 text-xs font-medium italic border border-dashed border-slate-800 rounded-2xl">
              No matching results found for "{query}".
            </div>
          ) : (
            results.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelectResult(item.url)}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {getIcon(item.type)}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {highlightMatch(item.title, query)}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[9px] font-extrabold uppercase text-slate-400 tracking-wider flex-shrink-0">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                      {highlightMatch(item.preview.replace(/[#*`_]/g, ''), query)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800/80">
                    {item.meta}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">ESC</kbd>
            <span>to close</span>
          </div>
          <div>
            <span>⚡ DevOS High-Velocity Search Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
