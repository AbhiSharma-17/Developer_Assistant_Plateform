import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCircle2, Clock, MessageSquare, UserPlus, AlertTriangle,
  GitBranch, Bot, Trash2, Check, Filter, RefreshCw, BellOff,
  Zap, FolderKanban, X, CheckCheck, Inbox
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const TYPE_CONFIG = {
  task:     { icon: CheckCircle2, bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',    label: 'Task',      dot: 'bg-blue-400' },
  deadline: { icon: Clock,        bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'Deadline',  dot: 'bg-amber-400' },
  mention:  { icon: MessageSquare,bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',label:'Mention',  dot: 'bg-purple-400' },
  invite:   { icon: UserPlus,     bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',label:'Invite', dot: 'bg-emerald-400' },
  alert:    { icon: AlertTriangle,bg: 'bg-red-500/15 text-red-400 border-red-500/30',        label: 'Alert',     dot: 'bg-red-400' },
  github:   { icon: GitBranch,    bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',  label: 'GitHub',    dot: 'bg-slate-400' },
  ai:       { icon: Bot,          bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',     label: 'AI',        dot: 'bg-cyan-400' },
  project:  { icon: FolderKanban, bg: 'bg-pink-500/15 text-pink-400 border-pink-500/30',     label: 'Project',   dot: 'bg-pink-400' },
};

const FALLBACK = [
  { id: 1,  title: 'Task Assigned',          message: 'Elena assigned you to "Implement OAuth2 Flow with GitHub"',              type: 'task',     is_read: false, priority: 'high',   created_at: '10 mins ago' },
  { id: 2,  title: 'Deadline Tomorrow',      message: 'Sprint 1 Deadline is tomorrow at 5:00 PM UTC ⏰ — 3 tasks pending',      type: 'deadline', is_read: false, priority: 'urgent', created_at: '1 hour ago'  },
  { id: 3,  title: 'Team Mention',           message: 'Elena mentioned you in #devops-infra: "@alex check the new Dockerfile config"', type: 'mention', is_read: false, priority: 'medium', created_at: '2 hours ago' },
  { id: 4,  title: 'Project Invitation',     message: 'You have been invited to collaborate on "GraphQL API Gateway"',           type: 'invite',   is_read: true,  priority: 'medium', created_at: '1 day ago'   },
  { id: 5,  title: 'Security Alert',         message: '3 failed login attempts detected from IP 203.0.113.42 — review activity logs', type: 'alert', is_read: false, priority: 'urgent', created_at: '3 hours ago' },
  { id: 6,  title: 'PR Review Request',      message: 'Marcus opened PR #47 "Add Redis caching layer" and requested your review', type: 'github',  is_read: false, priority: 'high',   created_at: '4 hours ago' },
  { id: 7,  title: 'AI Copilot Suggestion',  message: 'AI found 2 performance bottlenecks in your MySQL queries — click to view optimization report', type: 'ai', is_read: true, priority: 'medium', created_at: '5 hours ago' },
  { id: 8,  title: 'Sprint Goal Reached',    message: '🎉 Congratulations! Your team completed 94% of Sprint 3 objectives ahead of schedule', type: 'project', is_read: true, priority: 'low', created_at: '1 day ago' },
  { id: 9,  title: 'Task Overdue',           message: '"Write Redis caching layer for prompts" is 2 days overdue — update status or reassign', type: 'deadline', is_read: false, priority: 'urgent', created_at: '2 days ago' },
  { id: 10, title: 'New Team Member',        message: 'Priya Sharma joined your workspace as Backend Engineer — say hello in #general', type: 'invite', is_read: true, priority: 'low', created_at: '2 days ago' },
  { id: 11, title: 'GitHub Push',            message: 'Elena pushed 6 commits to branch "feat/oauth2" — build passing ✓',       type: 'github',  is_read: true,  priority: 'low',    created_at: '3 days ago'  },
  { id: 12, title: 'AI Report Ready',        message: 'Weekly productivity analysis is ready — your score improved by 18% this sprint', type: 'ai', is_read: true, priority: 'low', created_at: '3 days ago' },
];

const FILTERS = ['All', 'Unread', 'Task', 'Deadline', 'Mention', 'Alert', 'GitHub', 'AI', 'Project'];
const PRIORITY_COLOR = {
  urgent: 'text-red-400 bg-red-500/10 border-red-500/30',
  high:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  medium: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  low:    'text-slate-400 bg-slate-800 border-slate-700',
};

export default function Notifications() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeFilter, setActiveFilter]   = useState('All');
  const [selected, setSelected]           = useState(new Set());
  const [refreshing, setRefreshing]       = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res   = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data  = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications);
      } else {
        setNotifications(FALLBACK);
      }
    } catch {
      setNotifications(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    showToast('Notifications refreshed.', 'success');
  };

  const markRead = (id) =>
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));

  const markAllRead = () => {
    setNotifications(ns => ns.map(n => ({ ...n, is_read: true })));
    showToast('All notifications marked as read.', 'success');
  };

  const deleteNotif = (id) => {
    setNotifications(ns => ns.filter(n => n.id !== id));
    setSelected(s => { const c = new Set(s); c.delete(id); return c; });
    showToast('Notification dismissed.', 'info');
  };

  const deleteSelected = () => {
    const count = selected.size;
    setNotifications(ns => ns.filter(n => !selected.has(n.id)));
    setSelected(new Set());
    showToast(`${count} notification${count > 1 ? 's' : ''} deleted.`, 'success');
  };

  const toggleSelect = (id) =>
    setSelected(s => { const c = new Set(s); c.has(id) ? c.delete(id) : c.add(id); return c; });

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(n => n.id)));
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'All')    return true;
    if (activeFilter === 'Unread') return !n.is_read;
    return n.type === activeFilter.toLowerCase();
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Group by date label
  const groups = filtered.reduce((acc, n) => {
    const label = n.created_at.includes('min') || n.created_at.includes('hour')
      ? 'Today'
      : n.created_at.includes('1 day')
      ? 'Yesterday'
      : 'Earlier';
    if (!acc[label]) acc[label] = [];
    acc[label].push(n);
    return acc;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'Earlier'];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <div className="relative">
              <Bell className="h-8 w-8 text-purple-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span>Notifications Center</span>
          </h1>
          <p className="text-slate-400 text-sm">
            All workspace alerts, task assignments, deadlines, mentions, and AI updates in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',   value: notifications.length,        color: 'text-white',        icon: Inbox },
          { label: 'Unread',  value: unreadCount,                 color: 'text-purple-400',   icon: Bell },
          { label: 'Urgent',  value: notifications.filter(n => n.priority === 'urgent').length, color: 'text-red-400', icon: AlertTriangle },
          { label: 'AI Alerts', value: notifications.filter(n => n.type === 'ai').length,     color: 'text-cyan-400', icon: Bot },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
              <Icon className={`h-5 w-5 flex-shrink-0 ${s.color}`} />
              <div>
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Tabs ────────────────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-3 border border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <Filter className="h-4 w-4 text-purple-400 flex-shrink-0 ml-1" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex-shrink-0 ${
              activeFilter === f
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:bg-slate-900/60'
            }`}
          >
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Bulk Actions Bar ───────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 animate-fadeIn">
          <span className="text-sm font-semibold text-purple-300">
            {selected.size} notification{selected.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selected.forEach(id => markRead(id));
                showToast('Marked as read.', 'success');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-all"
            >
              <Check className="h-3.5 w-3.5" /> Mark Read
            </button>
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 border border-red-500/30 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Main Feed ──────────────────────────────────────────── */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">

        {/* Table Header */}
        <div className="flex items-center gap-3 px-6 py-3 bg-slate-950/60 border-b border-slate-800">
          <input
            type="checkbox"
            checked={filtered.length > 0 && selected.size === filtered.length}
            onChange={selectAll}
            className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {filtered.length} notification{filtered.length !== 1 ? 's' : ''} — {activeFilter}
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-28 text-center space-y-4">
            <BellOff className="h-10 w-10 text-slate-700 mx-auto" />
            <div className="text-slate-600 text-sm font-medium">No notifications for "{activeFilter}"</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {groupOrder.map(group => {
              const items = groups[group];
              if (!items?.length) return null;
              return (
                <div key={group}>
                  {/* Group Label */}
                  <div className="px-6 py-2 bg-slate-950/40 flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600">{group}</span>
                    <div className="flex-1 h-px bg-slate-800/60" />
                    <span className="text-[10px] text-slate-600 font-mono">{items.length}</span>
                  </div>

                  {items.map(n => {
                    const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.task;
                    const Icon = cfg.icon;
                    const isSelected = selected.has(n.id);
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-4 p-5 transition-all group cursor-pointer ${
                          isSelected
                            ? 'bg-purple-500/5 border-l-2 border-purple-500'
                            : n.is_read
                            ? 'hover:bg-slate-900/30 opacity-70 hover:opacity-100'
                            : 'hover:bg-slate-900/50 border-l-2 border-purple-500/60'
                        }`}
                        onClick={() => markRead(n.id)}
                      >
                        {/* Checkbox */}
                        <div className="flex-shrink-0 mt-0.5" onClick={e => { e.stopPropagation(); toggleSelect(n.id); }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                          />
                        </div>

                        {/* Unread dot */}
                        <div className="flex-shrink-0 mt-2.5">
                          <div className={`h-2 w-2 rounded-full transition-all ${n.is_read ? 'bg-transparent' : cfg.dot + ' shadow-sm'}`} />
                        </div>

                        {/* Type Icon */}
                        <div className={`flex-shrink-0 p-2.5 rounded-xl border mt-0.5 ${cfg.bg}`}>
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-sm font-bold ${n.is_read ? 'text-slate-300' : 'text-white'}`}>
                              {n.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_COLOR[n.priority]}`}>
                              {n.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg}`}>
                              {cfg.label}
                            </span>
                            {!n.is_read && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {n.message}
                          </p>
                        </div>

                        {/* Right: time + actions */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{n.created_at}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            {!n.is_read && (
                              <button
                                onClick={e => { e.stopPropagation(); markRead(n.id); showToast('Marked as read.', 'success'); }}
                                title="Mark as read"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 transition-all border border-slate-700"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                              title="Dismiss"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all border border-slate-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer Status ──────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span className="font-mono">Real-time sync active — auto-refresh every 30s</span>
          </div>
          <span className="font-mono">
            {unreadCount} unread · {notifications.length} total
          </span>
        </div>
      )}
    </div>
  );
}
