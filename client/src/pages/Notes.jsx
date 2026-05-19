import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Plus, Search, Trash2, Edit, Save, History, Eye, Code, 
  Bold, Italic, Heading, List, Link as LinkIcon, CheckCircle2, RotateCcw, Tag, Folder
} from 'lucide-react';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('write'); // 'write', 'preview', 'history'
  const [successMsg, setSuccessMsg] = useState('');

  // Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editContent, setEditContent] = useState('');
  const textareaRef = useRef(null);

  // New Note Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '', category: 'Architecture', content: '# New Document\n\nWrite your markdown specification here...', tags: ''
  });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotes(data.notes);
        if (data.notes.length > 0) {
          selectNote(data.notes[0]);
        }
      } else {
        useFallback();
      }
    } catch (err) {
      console.error('Fetch notes failed, using demo fallback', err);
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    const mockNotes = [
      { id: 1, title: 'DevOS System Architecture v1', category: 'Architecture', content: '# DevOS System Architecture\n\nWelcome to the official documentation for DevOS. This document outlines our high-level system design, database schemas, and microservice communication protocols.\n\n## 1. Core Stack\n- **Frontend**: React.js + Tailwind CSS v4\n- **Backend**: Node.js + Express.js\n- **Database**: MySQL 8.0 (InnoDB Pool)\n\n## 2. Authentication Flow\nWe utilize stateless JSON Web Tokens (JWT) signed with HMAC SHA256. Tokens are stored securely in client storage and passed via Bearer Authorization headers.\n\n```javascript\n// Middleware verify example\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);\n```\n\n## 3. Deployment Strategy\nAutomated multi-stage Docker builds deployed to AWS ECS with Application Load Balancers.', tags: 'architecture, system, docs', updated_at: '2026-05-18' },
      { id: 2, title: 'GraphQL Federation Guidelines', category: 'API Specs', content: '# GraphQL Federation Architecture\n\nThis guide establishes the standards for building subgraphs within the DevOS ecosystem.\n\n## Subgraph Requirements\n1. Must implement Apollo Federation v2 spec.\n2. Must extend the `@key` directive for Entity resolution.\n3. Keep resolvers lightweight and offload heavy processing to background workers.\n\n```graphql\ntype User @key(fields: "id") {\n  id: ID!\n  name: String!\n  projects: [Project]\n}\n```', tags: 'graphql, api, federation', updated_at: '2026-05-17' },
      { id: 3, title: 'Tailwind CSS v4 Design Tokens', category: 'Frontend', content: '# Tailwind CSS v4 Design Tokens\n\nOur design system is built upon glassmorphism principles and vibrant HSL gradients.\n\n### Glass Panels\nUse `backdrop-blur-md bg-slate-900/60 border border-slate-800/80` for standard cards.\n\n### Typography\nPrimary font family is **Inter** with fallback to system sans-serif.', tags: 'tailwind, css, design-system', updated_at: '2026-05-16' }
    ];
    setNotes(mockNotes);
    selectNote(mockNotes[0], true);
  };

  const selectNote = async (note, isMock = false) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditCategory(note.category);
    setEditTags(note.tags || '');
    setEditContent(note.content);
    setActiveTab('write');

    if (isMock) {
      setVersions([
        { id: 2, title: note.title, content: note.content, version_number: 2, created_at: 'Just now' },
        { id: 1, title: note.title, content: note.content + '\n\n*(Initial Draft)*', version_number: 1, created_at: '2 hours ago' }
      ]);
      return;
    }

    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`http://localhost:5000/api/notes/${note.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVersions(data.versions || []);
      } else {
        setVersions([
          { id: 2, title: note.title, content: note.content, version_number: 2, created_at: 'Just now' },
          { id: 1, title: note.title, content: note.content + '\n\n*(Initial Draft)*', version_number: 1, created_at: '2 hours ago' }
        ]);
      }
    } catch (err) {
      setVersions([
        { id: 2, title: note.title, content: note.content, version_number: 2, created_at: 'Just now' },
        { id: 1, title: note.title, content: note.content + '\n\n*(Initial Draft)*', version_number: 1, created_at: '2 hours ago' }
      ]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newNote)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotes([data.note, ...notes]);
        selectNote(data.note);
        setSuccessMsg('Document created successfully!');
      } else {
        const created = { id: Date.now(), ...newNote, updated_at: 'Just now' };
        setNotes([created, ...notes]);
        selectNote(created, true);
        setSuccessMsg('Document created successfully (demo mode)!');
      }
    } catch (err) {
      const created = { id: Date.now(), ...newNote, updated_at: 'Just now' };
      setNotes([created, ...notes]);
      selectNote(created, true);
      setSuccessMsg('Document created successfully (demo mode)!');
    }
    setNewNote({ title: '', category: 'Architecture', content: '# New Document\n\nWrite your markdown specification here...', tags: '' });
    setShowAddModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`http://localhost:5000/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editTitle, category: editCategory, content: editContent, tags: editTags })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Changes saved & new version created!');
        // Update local list
        setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, title: editTitle, category: editCategory, content: editContent, tags: editTags, updated_at: 'Just now' } : n));
        // Refresh versions
        selectNote({ ...selectedNote, title: editTitle, category: editCategory, content: editContent, tags: editTags });
      } else {
        setSuccessMsg('Changes saved (demo mode)!');
        setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, title: editTitle, category: editCategory, content: editContent, tags: editTags, updated_at: 'Just now' } : n));
        const newVer = { id: Date.now(), title: editTitle, content: editContent, version_number: versions.length + 1, created_at: 'Just now' };
        setVersions([newVer, ...versions]);
      }
    } catch (err) {
      setSuccessMsg('Changes saved (demo mode)!');
      setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, title: editTitle, category: editCategory, content: editContent, tags: editTags, updated_at: 'Just now' } : n));
      const newVer = { id: Date.now(), title: editTitle, content: editContent, version_number: versions.length + 1, created_at: 'Just now' };
      setVersions([newVer, ...versions]);
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNote?.id === id) {
        const remaining = notes.filter(n => n.id !== id);
        if (remaining.length > 0) selectNote(remaining[0]);
        else setSelectedNote(null);
      }
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Document deleted successfully!');
    } catch (err) {
      setSuccessMsg('Document deleted successfully (demo mode)!');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRestoreVersion = (ver) => {
    if (!window.confirm(`Restore content from Version ${ver.version_number}?`)) return;
    setEditContent(ver.content);
    setActiveTab('write');
    setSuccessMsg(`Restored content from v${ver.version_number}. Don't forget to save!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Rich Text Toolbar Actions
  const insertTextAtCursor = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end, text.length);

    const inserted = prefix + selected + suffix;
    setEditContent(before + inserted + after);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()) || n.tags?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'All' || n.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const categories = ['All', 'Architecture', 'API Specs', 'Frontend', 'Backend', 'DevOps'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <FileText className="h-8 w-8 text-emerald-400" />
            <span>Developer Wiki & Docs</span>
          </h1>
          <p className="text-slate-400 text-sm">Write architectural markdown, track version history, and organize engineering specifications.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 shadow-lg shadow-emerald-500/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Document</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold animate-scaleIn">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Note Directory */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 space-y-6 border border-slate-800">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900/60 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all backdrop-blur-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-xs font-medium border border-dashed border-slate-800 rounded-2xl">
                No documents found
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                    selectedNote?.id === note.id
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      <Folder className="h-3 w-3" />
                      <span>{note.category}</span>
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-slate-800"
                      title="Delete document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3 className={`text-sm font-bold truncate mb-1 ${selectedNote?.id === note.id ? 'text-white' : 'text-slate-200 group-hover:text-emerald-300'}`}>
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {note.content.replace(/[#*`_]/g, '')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Markdown Editor / Previewer & Version History */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-8 border border-slate-800 min-h-[650px] flex flex-col justify-between shadow-2xl relative">
          {selectedNote ? (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Note Header & Tab Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-2xl font-extrabold text-white bg-transparent focus:outline-none focus:border-b focus:border-emerald-500 w-full pb-1"
                    placeholder="Document Title..."
                  />
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="h-8 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Architecture">Architecture</option>
                      <option value="API Specs">API Specs</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="DevOps">DevOps</option>
                    </select>

                    <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                      <Tag className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="Tags (comma separated)..."
                        className="bg-transparent text-xs text-slate-400 focus:outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Mode Tabs */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setActiveTab('write')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === 'write' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Write</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === 'preview' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === 'history' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <History className="h-3.5 w-3.5" />
                      <span>Versions ({versions.length})</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSaveNote}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Editor Tab */}
              {activeTab === 'write' && (
                <div className="flex-1 flex flex-col space-y-4">
                  {/* Rich Text Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <button onClick={() => insertTextAtCursor('**', '**')} title="Bold" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <Bold className="h-4 w-4" />
                    </button>
                    <button onClick={() => insertTextAtCursor('*', '*')} title="Italic" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <Italic className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-[1px] bg-slate-800 mx-1" />
                    <button onClick={() => insertTextAtCursor('# ')} title="Heading 1" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <Heading className="h-4 w-4" />
                    </button>
                    <button onClick={() => insertTextAtCursor('## ')} title="Heading 2" className="px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold font-mono">
                      H2
                    </button>
                    <div className="h-4 w-[1px] bg-slate-800 mx-1" />
                    <button onClick={() => insertTextAtCursor('- ')} title="Bullet List" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <List className="h-4 w-4" />
                    </button>
                    <button onClick={() => insertTextAtCursor('```javascript\n', '\n```')} title="Code Block" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <Code className="h-4 w-4" />
                    </button>
                    <button onClick={() => insertTextAtCursor('[', '](https://)')} title="Insert Link" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 w-full min-h-[400px] rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 text-sm font-mono text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none custom-scrollbar leading-relaxed"
                    placeholder="Write your markdown document here..."
                  />
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="flex-1 min-h-[400px] rounded-2xl border border-slate-800 bg-[#121318]/80 p-8 text-slate-200 overflow-y-auto custom-scrollbar space-y-6 shadow-inner">
                  {editContent.split('\n\n').map((para, idx) => {
                    if (para.startsWith('# ')) return <h1 key={idx} className="text-3xl font-extrabold text-white pb-2 border-b border-slate-800">{para.replace('# ', '')}</h1>;
                    if (para.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-emerald-400 mt-6 mb-3">{para.replace('## ', '')}</h2>;
                    if (para.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-slate-200 mt-4 mb-2">{para.replace('### ', '')}</h3>;
                    if (para.startsWith('```')) return (
                      <pre key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400 my-4 shadow-md">
                        {para.replace(/```[a-z]*\n/g, '').replace(/\n```/g, '')}
                      </pre>
                    );
                    if (para.startsWith('- ')) return (
                      <ul key={idx} className="list-disc list-inside space-y-1.5 text-slate-300 ml-4 my-3">
                        {para.split('\n').map((li, lIdx) => <li key={lIdx}>{li.replace('- ', '')}</li>)}
                      </ul>
                    );
                    return <p key={idx} className="text-sm text-slate-300 leading-relaxed my-3">{para}</p>;
                  })}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="flex-1 space-y-4 min-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <History className="h-4 w-4 text-emerald-400" />
                    <span>Version History & Audit Log</span>
                  </h3>

                  {versions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">No version history available.</p>
                  ) : (
                    versions.map((ver) => (
                      <div key={ver.id} className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-4 group hover:border-emerald-500/40 transition-all">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
                              Version {ver.version_number}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">{ver.created_at}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{ver.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-3 font-mono bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                            {ver.content}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRestoreVersion(ver)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-emerald-500/40 transition-all shadow-sm flex-shrink-0"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-4">
              <FileText className="h-16 w-16 text-slate-700 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-slate-400 mb-1">No Document Selected</h3>
                <p className="text-xs text-slate-600 max-w-sm">Select a note from the left directory or create a new document to start writing markdown specifications.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
              >
                Create Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-8 max-w-xl w-full border border-slate-700/80 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Specification Document</h2>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Document Title</label>
                <input
                  type="text"
                  required
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Microservice Authentication Protocol"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Category</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="API Specs">API Specs</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
                    placeholder="auth, security, protocol..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Initial Content (Markdown)</label>
                <textarea
                  required
                  rows={8}
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 p-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none custom-scrollbar leading-relaxed"
                  placeholder="# Document Title..."
                />
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
