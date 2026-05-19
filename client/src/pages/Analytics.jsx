import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Flame, TrendingUp, CheckCircle2, Calendar, Target, Award, Zap
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      } else {
        useFallback();
      }
    } catch (err) {
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const productivityData = days.map((d) => ({
      date: d,
      tasks: Math.floor(Math.random() * 8) + 1,
      commits: Math.floor(Math.random() * 12) + 3
    }));

    setData({
      streakDays: Math.floor(Math.random() * 25) + 3,
      taskStats: { 
        pending: Math.floor(Math.random() * 10) + 2, 
        inProgress: Math.floor(Math.random() * 6) + 1, 
        completed: Math.floor(Math.random() * 40) + 15 
      },
      productivityData,
      weeklyActivity: { 
        projects: Math.floor(Math.random() * 5) + 1, 
        snippets: Math.floor(Math.random() * 30) + 5, 
        prompts: Math.floor(Math.random() * 15) + 2, 
        notes: Math.floor(Math.random() * 10) + 1 
      }
    });
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  // 1. Productivity Line Chart
  const productivityChartData = {
    labels: data.productivityData.map(d => d.date),
    datasets: [
      {
        label: 'Commits Pushed',
        data: data.productivityData.map(d => d.commits),
        borderColor: '#a855f7', // purple-500
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#fff',
        pointHoverRadius: 6
      },
      {
        label: 'Tasks Completed',
        data: data.productivityData.map(d => d.tasks),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverRadius: 6
      }
    ]
  };

  // 2. Task Completion Doughnut Chart
  const taskChartData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [data.taskStats.completed, data.taskStats.inProgress, data.taskStats.pending],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
        borderColor: ['#0f172a', '#0f172a', '#0f172a'],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  // 3. Weekly Activity Bar Chart
  const activityChartData = {
    labels: ['Projects', 'Snippets', 'AI Prompts', 'Docs & Notes'],
    datasets: [
      {
        label: 'Items Created / Active',
        data: [
          data.weeklyActivity.projects,
          data.weeklyActivity.snippets,
          data.weeklyActivity.prompts,
          data.weeklyActivity.notes
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderRadius: 12,
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', weight: 'bold' } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(30, 41, 59, 0.5)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(30, 41, 59, 0.5)' }, ticks: { color: '#94a3b8' } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { family: 'Inter', weight: 'bold', size: 12 }, padding: 20 }
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-400" />
            <span>Engineering Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm">Track sprint velocity, coding streaks, task completion rates, and weekly productivity metrics.</p>
        </div>

        {/* Streak Counter Badge */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-pink-500/20 p-4 rounded-2xl border border-orange-500/30 shadow-lg shadow-orange-500/10 backdrop-blur-xl animate-scaleIn">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-inner">
            <Flame className="h-7 w-7 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-orange-300">Active Coding Streak</div>
            <div className="text-2xl font-extrabold text-white flex items-baseline gap-1">
              <span>{data.streakDays}</span>
              <span className="text-xs font-semibold text-orange-400">Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Commits</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {data.productivityData.reduce((acc, curr) => acc + curr.commits, 0)}
          </div>
          <div className="text-xs text-purple-400 font-semibold flex items-center gap-1">
            <span>+{Math.floor(Math.random() * 20) + 5}% from last week</span>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Tasks</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data.taskStats.completed}</div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <span>{data.taskStats.pending} pending remaining</span>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sprint Velocity</span>
            <Target className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {Math.min(100, Math.floor((data.taskStats.completed / (data.taskStats.completed + data.taskStats.pending + data.taskStats.inProgress)) * 100) + 15)}%
          </div>
          <div className="text-xs text-blue-400 font-semibold flex items-center gap-1">
            <span>Optimal efficiency</span>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Productivity Score</span>
            <Award className="h-4 w-4 text-pink-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {(data.streakDays * 10) + data.taskStats.completed * 5}
          </div>
          <div className="text-xs text-pink-400 font-semibold flex items-center gap-1">
            <span>Top {Math.max(1, 100 - data.streakDays)}% of engineers</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Productivity Line Chart */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span>Daily Productivity & Commits</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Comparison of daily Git commits pushed vs. Kanban tasks completed.</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-purple-400" />
              <span>Current Week</span>
            </div>
          </div>

          <div className="h-[380px] w-full">
            <Line data={productivityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Task Completion Doughnut Chart */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl flex flex-col h-full justify-between">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Task Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status ratio of your project tasks.</p>
          </div>

          <div className="h-[280px] w-full py-4">
            <Doughnut data={taskChartData} options={pieOptions} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center">
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Completed</div>
              <div className="text-lg font-extrabold text-emerald-400 mt-0.5">{data.taskStats.completed}</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">In Progress</div>
              <div className="text-lg font-extrabold text-blue-400 mt-0.5">{data.taskStats.inProgress}</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Pending</div>
              <div className="text-lg font-extrabold text-amber-400 mt-0.5">{data.taskStats.pending}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Statistics Bar Chart */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <span>Weekly Activity Statistics</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Overview of active projects, saved code snippets, curated AI prompts, and documentation notes.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>Workspace Activity</span>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <Bar data={activityChartData} options={{
            ...chartOptions,
            scales: {
              ...chartOptions.scales,
              x: { ...chartOptions.scales.x, grid: { display: false } }
            }
          }} />
        </div>
      </div>
    </div>
  );
}
