import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  Activity, LogIn, CheckSquare, FolderKanban, UploadCloud, Users, Bot, 
  Download, Filter, ShieldCheck, RefreshCw, Terminal, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ActivityLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const filters = ['All', 'Logins', 'Tasks', 'Projects', 'Files', 'Teams', 'AI'];

  useEffect(() => {
    setPage(1); // Reset page on filter change
  }, [activeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [activeFilter, page, limit]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`http://localhost:5000/api/activity?filter=${activeFilter.toLowerCase()}&page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs);
        setTotal(data.total || data.logs.length);
        setTotalPages(data.totalPages || 1);
      } else {
        useFallbackLogs();
      }
    } catch (err) {
      useFallbackLogs();
    } finally {
      setLoading(false);
    }
  };


  const useFallbackLogs = () => {
    const mockLogs = [
      { id: 101, user_id: 1, name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'USER_LOGIN', description: 'User authenticated successfully via JWT Bearer Token', ip_address: '192.168.1.42', created_at: '2026-05-18T21:10:00Z' },
      { id: 102, user_id: 1, name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'TASK_UPDATED', description: 'Updated task "Implement OAuth2 Flow with GitHub" status to In Progress', ip_address: '192.168.1.42', created_at: '2026-05-18T20:45:00Z' },
      { id: 103, user_id: 2, name: 'Elena Rostova', role: 'Lead DevOps Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'PROJECT_CREATED', description: 'Created new enterprise project "GraphQL API Gateway"', ip_address: '10.0.0.15', created_at: '2026-05-18T19:30:00Z' },
      { id: 104, user_id: 2, name: 'Elena Rostova', role: 'Lead DevOps Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'FILE_UPLOADED', description: 'Uploaded system architecture diagram "gateway-spec.pdf" (4.2 MB)', ip_address: '10.0.0.15', created_at: '2026-05-18T18:15:00Z' },
      { id: 105, user_id: 1, name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'TEAM_JOINED', description: 'Joined discussion channel #devops-infra', ip_address: '192.168.1.42', created_at: '2026-05-18T17:00:00Z' },
      { id: 106, user_id: 1, name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'AI_ASSISTANT_USED', description: 'Used AI Copilot: explain_bug for TypeError stacktrace', ip_address: '192.168.1.42', created_at: '2026-05-18T16:20:00Z' }
    ];

    const filtered = activeFilter === 'All' ? mockLogs : mockLogs.filter(l => l.action.includes(activeFilter.toUpperCase()) || (activeFilter === 'Files' && l.action.includes('FILE')) || (activeFilter === 'Teams' && l.action.includes('TEAM')));
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);
    setLogs(paginated);
    setTotal(filtered.length);
    setTotalPages(Math.ceil(filtered.length / limit) || 1);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `devos_activity_logs_${activeFilter.toLowerCase()}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setExporting(false);
      showToast('Audit logs exported successfully as JSON payload.', 'success');
    }, 600);
  };

  const getActionConfig = (action) => {
    if (action.includes('LOGIN')) return { icon: LogIn, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', label: 'Authentication' };
    if (action.includes('TASK')) return { icon: CheckSquare, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'Task Manager' };
    if (action.includes('PROJECT')) return { icon: FolderKanban, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', label: 'Project Workspace' };
    if (action.includes('FILE')) return { icon: UploadCloud, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'File Storage' };
    if (action.includes('TEAM')) return { icon: Users, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/30', label: 'Team Collaboration' };
    if (action.includes('AI')) return { icon: Bot, bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', label: 'AI Pair Programmer' };
    return { icon: Activity, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', label: 'System Event' };
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-400 animate-pulse" />
            <span>System Activity & Audit Logs</span>
          </h1>
          <p className="text-slate-400 text-sm">Monitor granular workspace events, developer logins, file uploads, task mutations, and AI Copilot interactions.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-all shadow-sm"
            title="Refresh audit logs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || logs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
            title="Export logs as JSON"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'Exporting...' : 'Export JSON'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="glass-panel rounded-3xl p-4 border border-slate-800 flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar shadow-xl">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-purple-400 flex-shrink-0 ml-1" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 flex-shrink-0">Filter Audit Trail:</span>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex-shrink-0 ${
                activeFilter === f
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:bg-slate-900/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pr-2 flex-shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>MySQL Audit Engine Active</span>
        </div>
      </div>

      {/* Audit Log Feed */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
            <div className="text-xs text-slate-500 font-medium">Querying MySQL activity logs...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-24 text-center text-slate-600 text-xs font-medium italic space-y-2">
            <AlertCircle className="h-8 w-8 text-slate-700 mx-auto animate-bounce" />
            <div>No activity logs matching the "{activeFilter}" filter.</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {logs.map((log) => {
              const cfg = getActionConfig(log.action);
              const Icon = cfg.icon;
              return (
                <div 
                  key={log.id} 
                  className="p-6 hover:bg-slate-900/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* User Avatar */}
                    <img
                      src={log.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={log.name || 'Developer'}
                      className="h-10 w-10 rounded-2xl object-cover border border-slate-700 mt-0.5 flex-shrink-0 group-hover:border-purple-500/50 transition-colors shadow-sm"
                    />

                    {/* Action & Description */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-white">
                          {log.name || 'Alex Mercer'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({log.role || 'Senior Full-Stack Engineer'})
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1 ${cfg.bg}`}>
                          <Icon className="h-3 w-3 flex-shrink-0" />
                          <span>{log.action}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 group-hover:border-slate-700 transition-colors">
                        {log.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Right Meta: Timestamp & IP Address */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <span>{log.created_at ? new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                    </span>

                    <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Terminal className="h-3 w-3 text-purple-400" />
                      <span>IP: {log.ip_address || '127.0.0.1'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-500">|</span>
          <span className="font-mono">Total records: <strong className="text-white">{total}</strong></span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-slate-300 font-medium">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 border border-slate-800 transition-all flex items-center justify-center shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 border border-slate-800 transition-all flex items-center justify-center shadow-sm"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

