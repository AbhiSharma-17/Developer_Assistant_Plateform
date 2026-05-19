import { API_URL } from '../../config';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Terminal, Zap, LogOut, CheckCircle2, Clock, UserPlus, MessageSquare, Check, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import GlobalSearchModal from '../common/GlobalSearchModal';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications);
      } else {
        useFallbackNotifs();
      }
    } catch (err) {
      useFallbackNotifs();
    }
  };

  const useFallbackNotifs = () => {
    setNotifications([
      { id: 1, title: 'Task Assigned', message: 'Elena assigned you to "Implement OAuth2 Flow with GitHub"', type: 'task', is_read: false, created_at: '10 mins ago' },
      { id: 2, title: 'Deadline Reminder', message: 'Sprint 1 Deadline is tomorrow at 5:00 PM UTC ⏰', type: 'deadline', is_read: false, created_at: '1 hour ago' },
      { id: 3, title: 'Team Mention', message: 'Elena mentioned you in #devops-infra: "@alex check the new Dockerfile config"', type: 'mention', is_read: false, created_at: '2 hours ago' },
      { id: 4, title: 'Project Invitation', message: 'You have been invited to collaborate on "GraphQL API Gateway"', type: 'invite', is_read: true, created_at: '1 day ago' }
    ]);
  };

  const handleMarkAsRead = async (id) => {
    try {
      if (id === 'all') {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      } else {
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 w-full flex-shrink-0 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl">
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all border border-transparent hover:border-slate-700 hidden md:block"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 shadow-lg shadow-purple-500/30">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">
              DEV<span className="text-purple-400">OS</span>
            </span>
            </div>
          </div>

          <div className="relative hidden md:flex items-center" onClick={() => setIsSearchOpen(true)}>
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              readOnly
              placeholder="Search prompts, snippets, tasks (⌘K)..."
              className="h-10 w-80 rounded-xl border border-slate-800 bg-slate-950/50 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
            />
          </div>
        </div>


        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-sm font-medium text-purple-300 transition-all hover:bg-purple-500/20 hover:border-purple-500/50 shadow-sm shadow-purple-500/10">
            <Zap className="h-4 w-4 text-purple-400 animate-pulse" />
            <span>AI Copilot Active</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all border border-slate-800/80 shadow-sm"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400 animate-spin-slow" /> : <Moon className="h-5 w-5 text-purple-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>

            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-purple-500 animate-ping" />
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-3xl p-4 border border-slate-700/80 shadow-2xl z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => handleMarkAsRead('all')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      <span>Mark all as read</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 italic">No notifications</div>
                  ) : (
                    notifications.map((n) => {
                      return (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                            n.is_read 
                              ? 'bg-slate-950/40 border-slate-800/60 opacity-60' 
                              : 'bg-gradient-to-r from-purple-500/10 via-slate-900 to-blue-500/10 border-purple-500/30 shadow-md shadow-purple-500/5'
                          }`}
                        >
                          <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                            n.type === 'task' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            n.type === 'deadline' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            n.type === 'mention' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {n.type === 'task' ? <CheckCircle2 className="h-4 w-4" /> :
                             n.type === 'deadline' ? <Clock className="h-4 w-4" /> :
                             n.type === 'mention' ? <MessageSquare className="h-4 w-4" /> :
                             <UserPlus className="h-4 w-4" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h4 className={`text-xs font-bold truncate ${n.is_read ? 'text-slate-400' : 'text-slate-200'}`}>
                                {n.title}
                              </h4>
                              <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{n.created_at}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Link
                  to="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-purple-400 hover:text-purple-300 border border-slate-800 transition-all"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>View All Notifications</span>
                </Link>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-9 w-9 rounded-xl object-cover border border-purple-500/30 shadow-sm"
              />
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-slate-200">{user.name}</div>
                <div className="text-xs text-slate-400">{user.role}</div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="rounded-xl p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
