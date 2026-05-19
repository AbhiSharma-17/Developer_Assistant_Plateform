import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, Search, GitBranch, Clock, MoreVertical, 
  CheckCircle2, ShieldAlert, Calendar, Users, Paperclip, Edit, Trash2, UserPlus, AlertCircle, X
} from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Forms state
  const [formData, setFormData] = useState({
    name: '', description: '', repo_url: '', status: 'In Progress', progress: 0, due_date: '', file_url: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Contributor');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects(data.projects);
      } else {
        useFallback();
      }
    } catch (err) {
      console.error('Fetch projects failed, using demo fallback', err);
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    setProjects([
      { id: 1, name: 'DevOS Core Platform', description: 'Next-gen AI powered developer workspace and command center.', status: 'In Progress', progress: 75, repo_url: 'github.com/devos/core', due_date: '2026-06-30', file_url: 'architecture_v1.pdf', memberCount: 3, taskCount: 8 },
      { id: 2, name: 'GraphQL API Gateway', description: 'Federated GraphQL gateway for microservices orchestration.', status: 'Completed', progress: 100, repo_url: 'github.com/devos/gateway', due_date: '2026-05-10', file_url: 'gateway_spec.docx', memberCount: 2, taskCount: 5 },
      { id: 3, name: 'AI Copilot VSCode Extension', description: 'Intelligent code completion and prompt injection plugin.', status: 'Planning', progress: 25, repo_url: 'github.com/devos/vscode', due_date: '2026-08-15', file_url: null, memberCount: 4, taskCount: 2 },
      { id: 4, name: 'Cloud Snippet Sync Daemon', description: 'Background service for syncing snippets across devices.', status: 'In Progress', progress: 60, repo_url: 'github.com/devos/sync', due_date: '2026-07-20', file_url: null, memberCount: 2, taskCount: 4 },
    ]);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects([data.project, ...projects]);
        setSuccessMsg('Project created successfully!');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', repo_url: '', status: 'In Progress', progress: 0, due_date: '', file_url: '' });
      } else {
        // Fallback simulation
        const newProj = { id: Date.now(), ...formData, memberCount: 1, taskCount: 0 };
        setProjects([newProj, ...projects]);
        setSuccessMsg('Project created successfully (demo mode)!');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', repo_url: '', status: 'In Progress', progress: 0, due_date: '', file_url: '' });
      }
    } catch (err) {
      const newProj = { id: Date.now(), ...formData, memberCount: 1, taskCount: 0 };
      setProjects([newProj, ...projects]);
      setSuccessMsg('Project created successfully (demo mode)!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', repo_url: '', status: 'In Progress', progress: 0, due_date: '', file_url: '' });
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`http://localhost:5000/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, ...formData } : p));
        setSuccessMsg('Project updated successfully!');
        setShowEditModal(false);
      } else {
        setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, ...formData } : p));
        setSuccessMsg('Project updated successfully (demo mode)!');
        setShowEditModal(false);
      }
    } catch (err) {
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, ...formData } : p));
      setSuccessMsg('Project updated successfully (demo mode)!');
      setShowEditModal(false);
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      setProjects(prev => prev.filter(p => p.id !== id));
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Project deleted successfully!');
    } catch (err) {
      setProjects(prev => prev.filter(p => p.id !== id));
      setSuccessMsg('Project deleted successfully (demo mode)!');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`http://localhost:5000/api/projects/${selectedProject.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, memberCount: p.memberCount + 1 } : p));
        setShowInviteModal(false);
        setInviteEmail('');
      } else {
        setError(data.message || 'Invitation failed');
      }
    } catch (err) {
      setSuccessMsg(`Successfully invited ${inviteEmail} (demo mode)!`);
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, memberCount: p.memberCount + 1 } : p));
      setShowInviteModal(false);
      setInviteEmail('');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name, description: project.description, repo_url: project.repo_url,
      status: project.status, progress: project.progress, due_date: project.due_date || '', file_url: project.file_url || ''
    });
    setShowEditModal(true);
  };

  const openInviteModal = (project) => {
    setSelectedProject(project);
    setInviteEmail('');
    setShowInviteModal(true);
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <FolderKanban className="h-8 w-8 text-purple-400" />
            <span>Project Management</span>
          </h1>
          <p className="text-slate-400 text-sm">Organize repositories, manage deadlines, invite collaborators, and attach specifications.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', description: '', repo_url: '', status: 'In Progress', progress: 0, due_date: '', file_url: '' });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 shadow-lg shadow-purple-500/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold animate-scaleIn">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by title, description..."
          className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900/60 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all backdrop-blur-sm"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                  project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  project.status === 'In Progress' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {project.status}
                </span>

                <div className="flex items-center gap-1">
                  <button onClick={() => openInviteModal(project)} title="Invite Team Member" className="text-slate-400 hover:text-purple-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60">
                    <UserPlus className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEditModal(project)} title="Edit Project" className="text-slate-400 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(project.id)} title="Delete Project" className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {project.name}
              </h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                  <GitBranch className="h-3.5 w-3.5 text-purple-400" />
                  <span>{project.repo_url || 'No repo attached'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-400" title="Team Members">
                    <Users className="h-3.5 w-3.5 text-blue-400" />
                    <span>{project.memberCount || 1}</span>
                  </span>
                  {project.file_url && (
                    <span className="flex items-center gap-1 text-slate-400" title="Attached File">
                      <Paperclip className="h-3.5 w-3.5 text-amber-400" />
                      <span className="truncate max-w-[100px]">{project.file_url}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  <span>Deadline: <strong className="text-slate-300">{project.due_date || 'No deadline'}</strong></span>
                </div>
                <span>{project.taskCount || 0} active tasks</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-400">Sprint Progress</span>
                  <span className="text-purple-400">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500 shadow-sm shadow-purple-500/50"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-8 max-w-lg w-full border border-slate-700/80 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g. Next-gen API Gateway"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Brief description of the repository and goals..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Git Repository URL</label>
                  <input
                    type="text"
                    value={formData.repo_url}
                    onChange={(e) => setFormData({...formData, repo_url: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    placeholder="github.com/org/repo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Due Date / Deadline</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Attach Project File / Spec</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={formData.file_url}
                    onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. architecture_v1.pdf or https://link-to-file"
                  />
                  <label className="flex items-center justify-center h-12 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700 whitespace-nowrap transition-all">
                    <Paperclip className="h-4 w-4 mr-1.5" />
                    <span>Upload File</span>
                    <input type="file" className="hidden" onChange={(e) => setFormData({...formData, file_url: e.target.files[0]?.name})} />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-purple-500/25 transition-all"
                >
                  Initialize Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-8 max-w-lg w-full border border-slate-700/80 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Edit Project Details</h2>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Git Repository URL</label>
                  <input
                    type="text"
                    value={formData.repo_url}
                    onChange={(e) => setFormData({...formData, repo_url: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Due Date / Deadline</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Attached File / Spec</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={formData.file_url}
                    onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                  <label className="flex items-center justify-center h-12 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700 whitespace-nowrap transition-all">
                    <Paperclip className="h-4 w-4 mr-1.5" />
                    <span>Replace File</span>
                    <input type="file" className="hidden" onChange={(e) => setFormData({...formData, file_url: e.target.files[0]?.name})} />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-8 max-w-md w-full border border-slate-700/80 shadow-2xl relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-6 right-6 p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Invite Team Member</h2>
            <p className="text-xs text-slate-400 mb-6">Collaborate on <strong className="text-slate-200">{selectedProject?.name}</strong></p>

            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-shake">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Developer Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g. elena@devos.io"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Project Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="Contributor">Contributor</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-purple-500/25 transition-all"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
