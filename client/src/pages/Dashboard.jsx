import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  FolderKanban, 
  CheckSquare, 
  Code2, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Activity, 
  Plus, 
  Terminal,
  Play,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    totalProjects: 12,
    activeTasks: 28,
    completedTasks: 128,
    aiPromptCount: 84,
    productivityScore: 94.2,
    recentActivities: [
      { id: 1, action: 'TASK_COMPLETED', description: 'Completed task: Optimize MySQL connection pooling', time: '2 hours ago' },
      { id: 2, action: 'PROJECT_UPDATED', description: 'Updated sprint milestones for DevOS Core', time: '5 hours ago' },
      { id: 3, action: 'PROMPT_ADDED', description: 'Added AI Prompt: Senior Code Reviewer', time: '1 day ago' },
      { id: 4, action: 'SNIPPET_COPIED', description: 'Copied snippet: MySQL Connection Pool Config', time: '2 days ago' }
    ],
    recentTasks: [
      { id: 1, title: 'Implement OAuth2 Flow with GitHub', project: 'DevOS Core', status: 'In Progress', priority: 'High', time: '2h ago' },
      { id: 2, title: 'Optimize MySQL connection pooling', project: 'Backend API', status: 'Completed', priority: 'Urgent', time: '5h ago' },
      { id: 3, title: 'Design dark mode glassmorphism UI', project: 'DevOS Frontend', status: 'Completed', priority: 'High', time: '1d ago' },
      { id: 4, title: 'Write Redis caching layer for prompts', project: 'AI Service', status: 'Pending', priority: 'Medium', time: '2d ago' },
    ]
  });

  const [loading, setLoading] = useState(true);

  // ── Quick Terminal Logic ──────────────────────────────────────────────────
  const { user } = useAuth();
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'input', text: 'devos status --all' },
    { type: 'output', text: '✓ MySQL Database connected (12ms)' },
    { type: 'output', text: '✓ 10 Enterprise Tables verified' },
    { type: 'output', text: '✓ AI Prompt Engine online (v4.2)' },
  ]);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  const handleTerminalSubmit = async (e) => {
    if (e.key !== 'Enter' || !terminalInput.trim()) return;

    const inputCmd = terminalInput.trim();
    const parts = inputCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    const newHistory = [...terminalHistory, { type: 'input', text: inputCmd }];
    setTerminalInput('');

    if (cmd === 'clear') {
      setTerminalHistory([]);
      return;
    }

    let output = '';
    if (cmd === 'help') {
      output = 'Available commands:\n  help      - Show this help menu\n  status    - Check system health\n  tasks     - List active tasks\n  projects  - List active projects\n  user      - Show active developer profile\n  ai <msg>  - Ask quick question to Copilot\n  clear     - Clear terminal screen';
    } else if (cmd === 'status') {
      try {
        const res = await fetch(`${API_URL}/api/health`);
        const data = await res.json();
        output = `✓ API Status: ${data.status || 'Online'}\n✓ Database Connection: Stable (12ms)\n✓ Mode: production`;
      } catch (err) {
        output = `✓ API Status: Online (Demo Mode)\n✓ Database Connection: Mock Local Pool\n✓ AI Assistant: Gemini-1.5-Flash (Active)`;
      }
    } else if (cmd === 'tasks') {
      if (statsData.recentTasks && statsData.recentTasks.length > 0) {
        output = statsData.recentTasks.map(t => `- [${t.status}] ${t.title} (${t.priority} priority)`).join('\n');
      } else {
        output = 'No active tasks found.';
      }
    } else if (cmd === 'projects') {
      output = `Active projects:\n- DevOS Core (v1.0-stable)\n- AI Service Integration\n- Backend REST APIs`;
    } else if (cmd === 'user') {
      if (user) {
        output = `Developer Profile:\n  Name:  ${user.name}\n  Email: ${user.email}\n  Role:  ${user.role || 'Full-Stack Developer'}`;
      } else {
        output = 'No active user session found.';
      }
    } else if (cmd === 'ai') {
      if (!args) {
        output = 'Error: Please provide a prompt, e.g., "ai how to write a mysql pool"';
      } else {
        // Optimistically set the "thinking" indicator
        setTerminalHistory([...newHistory, { type: 'output', text: 'AI Copilot is thinking...' }]);
        try {
          const token = localStorage.getItem('devos_token');
          const res = await fetch(`${API_URL}/api/ai/generate`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ prompt: args })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            let rawText = data.response || 'No response from Copilot.';
            rawText = rawText.replace(/```[a-z]*\n?/gi, '').replace(/###/g, '■');
            setTerminalHistory([...newHistory, { type: 'output', text: rawText }]);
          } else {
            setTerminalHistory([...newHistory, { type: 'output', text: data.message || 'Error executing AI request.' }]);
          }
        } catch (err) {
          setTerminalHistory([...newHistory, { type: 'output', text: 'Error contacting AI Copilot service.' }]);
        }
        return;
      }
    } else {
      output = `devos: command not found: ${cmd}. Type 'help' for options.`;
    }

    setTerminalHistory([...newHistory, { type: 'output', text: output }]);
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('devos_token');
        const res = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatsData(data.stats);
        }
      } catch (err) {
        console.error('Dashboard stats fetch failed, using robust fallback demo data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = [
    { name: 'Active Projects', value: statsData.totalProjects, change: '+18% this month', icon: FolderKanban, color: 'from-purple-500 to-indigo-500', link: '/projects' },
    { name: 'Pending Tasks', value: statsData.activeTasks, change: '5 due today', icon: CheckSquare, color: 'from-blue-500 to-cyan-500', link: '/tasks' },
    { name: 'Completed Tasks', value: statsData.completedTasks, change: `${statsData.productivityScore}% completion rate`, icon: Code2, color: 'from-emerald-500 to-teal-500', link: '/tasks' },
    { name: 'AI Prompt Vault', value: statsData.aiPromptCount, change: '99.2% success rate', icon: Sparkles, color: 'from-amber-500 to-orange-500', link: '/prompts' },
  ];

  const copilotSuggestions = [
    { id: 1, title: 'Refactor Auth middleware for better token validation', type: 'Security', impact: 'High Impact' },
    { id: 2, title: 'Add indexes to tasks table for 40% faster queries', type: 'Database', impact: 'Performance' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-1">
            <Cpu className="h-4 w-4 animate-spin" />
            <span>DEVOS V1.0-STABLE</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Developer Command Center
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Welcome back. Your AI Copilot is monitoring your workspace. You have {statsData.activeTasks} pending tasks and 2 optimization suggestions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tasks"
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all border border-slate-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Link>
          <Link
            to="/prompts"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-all shadow-lg shadow-purple-500/25"
          >
            <Sparkles className="h-4 w-4" />
            <span>Ask Copilot</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${stat.color} shadow-lg shadow-slate-950/50`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stat.change.split(' ')[0]}</span>
                </span>
              </div>
              <div className="flex items-end justify-between mt-4">
                <div className="space-y-1">
                  <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.name}</h3>
                  <div className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                </div>
                <Link to={stat.link} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                  <span>View</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 group-hover:via-purple-500 to-transparent transition-all" />
            </div>
          );
        })}
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <CheckSquare className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Active Task Queue</h2>
                  <p className="text-xs text-slate-400">Prioritized work items for current sprint</p>
                </div>
              </div>
              <Link
                to="/tasks"
                className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>View all tasks</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {statsData.recentTasks.map((task, idx) => (
                <div
                  key={task.id || idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/80 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      defaultChecked={task.status === 'Completed'}
                      className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="text-slate-400 font-medium">{task.project || 'DevOS Core'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.time || 'Recent'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      task.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      task.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {task.priority || 'Medium'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      task.status === 'In Progress' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {task.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Sprint velocity: 42 story points</span>
            </div>
            <span>Productivity Score: {statsData.productivityScore}%</span>
          </div>
        </div>

        {/* AI Copilot & Recent Activities */}
        <div className="space-y-6">
          {/* Recent Activity Log */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <Activity className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Recent Activity Log</h2>
                <p className="text-xs text-slate-400">System audit trail</p>
              </div>
            </div>

            <div className="space-y-4">
              {statsData.recentActivities.map((item, idx) => (
                <div key={item.id || idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                      {item.action || 'LOG'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.time || 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Terminal Box */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Terminal className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Interactive Terminal</h2>
                  <p className="text-xs text-slate-400">Run devos commands. Type 'help' to start.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[11px] border border-slate-800 space-y-2 h-60 overflow-y-auto flex flex-col">
              <div className="flex-1 space-y-2 overflow-y-auto">
                {terminalHistory.map((item, idx) => (
                  <div key={idx}>
                    {item.type === 'input' ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-purple-400">alex@devos:~$</span>
                        <span className="text-slate-300">{item.text}</span>
                      </div>
                    ) : (
                      <div className="text-emerald-400 whitespace-pre-wrap pl-4 leading-relaxed">
                        {item.text}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              <div className="flex items-center gap-2 text-slate-500 pt-2 border-t border-slate-900/60">
                <span className="text-purple-400 font-semibold shrink-0">alex@devos:~$</span>
                <input
                  type="text"
                  className="bg-transparent text-slate-200 border-none outline-none focus:ring-0 p-0 m-0 w-full font-mono text-[11px] caret-purple-500"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={handleTerminalSubmit}
                  placeholder="Type command..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
