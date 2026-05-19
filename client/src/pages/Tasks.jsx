import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Search, Filter, Clock, Calendar, AlertCircle, 
  MessageSquare, User, Tag, ArrowRight, CheckCircle2, Send, Edit, Trash2, GripVertical, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Forms state
  const [newTask, setNewTask] = useState({
    title: '', description: '', project_id: 1, assigned_to: user?.id || 1, priority: 'Medium', category: 'Backend', due_date: 'Today'
  });
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks(data.tasks);
      } else {
        useFallback();
      }

      // Fetch projects for dropdown
      const pRes = await fetch(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pData = await pRes.json();
      if (pRes.ok && pData.success) {
        setProjects(pData.projects);
      } else {
        setProjects([{ id: 1, name: 'DevOS Core Platform' }, { id: 2, name: 'GraphQL API Gateway' }]);
      }

      // Mock users list for assignment
      setUsers([
        { id: 1, name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
        { id: 2, name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      ]);

    } catch (err) {
      console.error('Fetch tasks failed, using demo fallback', err);
      useFallback();
      setProjects([{ id: 1, name: 'DevOS Core Platform' }, { id: 2, name: 'GraphQL API Gateway' }]);
      setUsers([
        { id: 1, name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
        { id: 2, name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    setTasks([
      { id: 1, title: 'Implement OAuth2 Flow with GitHub', description: 'Add GitHub SSO login support', project_id: 1, project_name: 'DevOS Core Platform', assigned_to: 1, assignee_name: 'Alex Mercer', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'In Progress', priority: 'High', due_date: 'Today', category: 'Backend', commentCount: 2 },
      { id: 2, title: 'Optimize MySQL connection pooling', description: 'Configure pool limits and timeouts', project_id: 2, project_name: 'GraphQL API Gateway', assigned_to: 2, assignee_name: 'Elena Rostova', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Completed', priority: 'Urgent', due_date: 'Yesterday', category: 'Database', commentCount: 1 },
      { id: 3, title: 'Design dark mode glassmorphism UI', description: 'Create beautiful Tailwind v4 theme', project_id: 1, project_name: 'DevOS Core Platform', assigned_to: 1, assignee_name: 'Alex Mercer', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Completed', priority: 'High', due_date: 'May 14', category: 'Design', commentCount: 0 },
      { id: 4, title: 'Write Redis caching layer for prompts', description: 'Cache frequent AI prompt templates', project_id: 2, project_name: 'GraphQL API Gateway', assigned_to: 2, assignee_name: 'Elena Rostova', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Pending', priority: 'Medium', due_date: 'May 20', category: 'AI', commentCount: 3 },
      { id: 5, title: 'Setup GitHub Actions CI/CD pipeline', description: 'Automate tests and Docker builds', project_id: 1, project_name: 'DevOS Core Platform', assigned_to: 1, assignee_name: 'Alex Mercer', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Pending', priority: 'Urgent', due_date: 'May 22', category: 'DevOps', commentCount: 1 },
    ]);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks([data.task, ...tasks]);
        setSuccessMsg('Task created successfully!');
      } else {
        const created = { id: Date.now(), ...newTask, project_name: projects.find(p => p.id == newTask.project_id)?.name || 'DevOS Core', assignee_name: users.find(u => u.id == newTask.assigned_to)?.name || 'Alex Mercer', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Pending', commentCount: 0 };
        setTasks([created, ...tasks]);
        setSuccessMsg('Task created successfully (demo mode)!');
      }
    } catch (err) {
      const created = { id: Date.now(), ...newTask, project_name: projects.find(p => p.id == newTask.project_id)?.name || 'DevOS Core', assignee_name: users.find(u => u.id == newTask.assigned_to)?.name || 'Alex Mercer', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Pending', commentCount: 0 };
      setTasks([created, ...tasks]);
      setSuccessMsg('Task created successfully (demo mode)!');
    }
    setNewTask({ title: '', description: '', project_id: projects[0]?.id || 1, assigned_to: user?.id || 1, priority: 'Medium', category: 'Backend', due_date: 'Today' });
    setShowAddModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Status update error', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Task deleted successfully!');
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSuccessMsg('Task deleted successfully (demo mode)!');
    }
    setShowDetailModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openTaskDetail = async (task) => {
    setSelectedTask(task);
    setComments([]);
    setShowDetailModal(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`http://localhost:5000/api/tasks/${task.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComments(data.comments);
      } else {
        setComments([
          { id: 1, user_name: 'Elena Rostova', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', comment: 'Looks great! Let me know if you need help with the CI/CD pipeline.', created_at: '2 hours ago' },
          { id: 2, user_name: 'Alex Mercer', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', comment: 'Thanks Elena! I will push the initial GitHub Actions workflow shortly.', created_at: '1 hour ago' }
        ]);
      }
    } catch (err) {
      setComments([
        { id: 1, user_name: 'Elena Rostova', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', comment: 'Looks great! Let me know if you need help with the CI/CD pipeline.', created_at: '2 hours ago' },
        { id: 2, user_name: 'Alex Mercer', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', comment: 'Thanks Elena! I will push the initial GitHub Actions workflow shortly.', created_at: '1 hour ago' }
      ]);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment) return;
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`http://localhost:5000/api/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: newComment })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComments([...comments, data.comment]);
        setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, commentCount: t.commentCount + 1 } : t));
      } else {
        const c = { id: Date.now(), user_name: user?.name || 'Alex Mercer', user_avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', comment: newComment, created_at: 'Just now' };
        setComments([...comments, c]);
        setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, commentCount: t.commentCount + 1 } : t));
      }
    } catch (err) {
      const c = { id: Date.now(), user_name: user?.name || 'Alex Mercer', user_avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', comment: newComment, created_at: 'Just now' };
      setComments([...comments, c]);
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, commentCount: t.commentCount + 1 } : t));
    }
    setNewComment('');
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      handleUpdateStatus(parseInt(taskId), targetStatus);
    }
    setDraggedTaskId(null);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.project_name?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const columns = [
    { title: 'Todo', status: 'Pending', color: 'border-blue-500/30 bg-blue-500/5', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { title: 'In Progress', status: 'In Progress', color: 'border-purple-500/30 bg-purple-500/5', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { title: 'Completed', status: 'Completed', color: 'border-emerald-500/30 bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-blue-400" />
            <span>Kanban Task Board</span>
          </h1>
          <p className="text-slate-400 text-sm">Drag and drop sprint tasks, assign developers, set priorities, and collaborate via comments.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold animate-scaleIn">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, project..."
            className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900/60 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all backdrop-blur-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Priority:</span>
          {['All', 'Urgent', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterPriority === p
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start min-h-[600px]">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.status);
          return (
            <div
              key={col.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`glass-panel rounded-3xl p-6 border ${col.color} flex flex-col gap-4 min-h-[500px] transition-all`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{col.title}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${col.badge} font-bold`}>
                    {colTasks.length}
                  </span>
                </h2>
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto max-h-[650px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-600 text-xs font-medium border border-dashed border-slate-800/80 rounded-2xl">
                    Drop tasks here
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => openTaskDetail(task)}
                      className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 bg-slate-950/60 cursor-pointer group relative overflow-hidden space-y-3 shadow-md hover:border-blue-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          task.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          task.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          task.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {task.priority}
                        </span>
                        <GripVertical className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                      </div>

                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors leading-snug">
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <img
                            src={task.assignee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={task.assignee_name}
                            className="h-6 w-6 rounded-full object-cover border border-slate-700"
                            title={`Assigned to: ${task.assignee_name}`}
                          />
                          <span className="truncate max-w-[100px] text-slate-400">{task.assignee_name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-400" title="Due Date">
                            <Calendar className="h-3.5 w-3.5 text-purple-400" />
                            <span>{task.due_date}</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-400" title="Comments">
                            <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                            <span>{task.commentCount || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-8 max-w-lg w-full border border-slate-700/80 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Create Kanban Task</h2>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Optimize Docker build caching"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Detailed task description and acceptance criteria..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Project</label>
                  <select
                    value={newTask.project_id}
                    onChange={(e) => setNewTask({...newTask, project_id: parseInt(e.target.value)})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Assignee</label>
                  <select
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({...newTask, assigned_to: parseInt(e.target.value)})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Category</label>
                  <input
                    type="text"
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                    placeholder="Backend, DevOps..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Due Date</label>
                  <input
                    type="text"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Tomorrow"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail & Comments Modal */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-8 max-w-2xl w-full border border-slate-700/80 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                      selectedTask.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      selectedTask.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      selectedTask.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {selectedTask.priority} Priority
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                      {selectedTask.project_name || 'DevOS Core'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">{selectedTask.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTask.status}
                    onChange={(e) => {
                      const s = e.target.value;
                      setSelectedTask({...selectedTask, status: s});
                      handleUpdateStatus(selectedTask.id, s);
                    }}
                    className="h-10 rounded-xl border border-slate-700 bg-slate-900 px-4 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Pending">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button onClick={() => handleDeleteTask(selectedTask.id)} title="Delete Task" className="p-2 rounded-xl border border-slate-700 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setShowDetailModal(false)} title="Close" className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-2xl p-6 border border-slate-800 mb-6 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedTask.description}
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 border border-slate-800 mb-6 text-xs text-slate-400">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedTask.assignee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="font-semibold text-slate-200">{selectedTask.assignee_name}</div>
                    <div className="text-[10px] text-slate-500">Assigned Developer</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span>Due: {selectedTask.due_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-blue-400" />
                    <span>{selectedTask.category}</span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 mb-6 max-h-[220px] overflow-y-auto pr-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <span>Discussion & Comments ({comments.length})</span>
                </h3>

                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No comments yet. Start the discussion below!</p>
                ) : (
                  comments.map((c, idx) => (
                    <div key={c.id || idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                      <img src={c.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="Avatar" className="h-8 w-8 rounded-full object-cover border border-slate-700 flex-shrink-0" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{c.user_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{c.created_at}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{c.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <button type="submit" className="flex items-center justify-center h-12 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all">
                <Send className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setShowDetailModal(false)} className="px-5 h-12 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-all">
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
