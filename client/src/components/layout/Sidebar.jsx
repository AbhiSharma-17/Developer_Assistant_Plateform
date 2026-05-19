import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Code2, 
  Sparkles, 
  BarChart3, 
  Settings,
  ShieldAlert,
  FileText,
  MessageSquare,
  GitBranch,
  Bot,
  Activity,
  Cloud,
  Bell
} from 'lucide-react';

export default function Sidebar({ isOpen = true }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Task Manager', path: '/tasks', icon: CheckSquare },
    { name: 'AI Copilot', path: '/copilot', icon: Bot },
    { name: 'Team Chat', path: '/chat', icon: MessageSquare },
    { name: 'GitHub Integration', path: '/github', icon: GitBranch },
    { name: 'File Storage', path: '/files', icon: Cloud },

    { name: 'Code Snippets', path: '/snippets', icon: Code2 },
    { name: 'Developer Notes', path: '/notes', icon: FileText },
    { name: 'AI Prompt Vault', path: '/prompts', icon: Sparkles },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Activity Logs', path: '/activity', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];






  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex-shrink-0 border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-xl flex flex-col h-full overflow-hidden`}>
      <div className="p-4 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap overflow-hidden">
            Navigation
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center ${isOpen ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 ${isOpen ? 'border-l-4' : 'border-l-2'} border-purple-500 shadow-lg shadow-purple-500/10`
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
              title={!isOpen ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {isOpen && (
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/20 whitespace-nowrap overflow-hidden">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-blue-900/30 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl" />
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-1">
              <ShieldAlert className="h-4 w-4" />
              <span>Pro Plan Active</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Unlimited AI prompts and cloud snippet storage synced.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full w-4/5 shadow-sm shadow-purple-500/50" />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5">
              <span>Storage</span>
              <span>80% used</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
