import { API_URL, SOCKET_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Hash, Plus, Send, Smile, Users, Circle, Search, CheckCircle2, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

let socket;

export default function Chat() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  // Emojis for quick toolbar
  const quickEmojis = ['😀', '🚀', '🔥', '👍', '❤️', '🎉', '👀', '✅', '💻', '✨'];

  useEffect(() => {
    // Connect Socket.IO
    socket = io(SOCKET_URL);

    if (user) {
      socket.emit('user_connected', { id: user.id, name: user.name, avatar: user.avatar });
    }

    socket.on('online_users', (users) => {
      // Deduplicate by ID
      const unique = Array.from(new Map(users.map(u => [u.id, u])).values());
      setOnlineUsers(unique);
    });

    socket.on('receive_message', (message) => {
      setMessages(prev => {
        // Prevent duplication from optimistic UI updates
        if (prev.some(m => m.id === message.id || (m.content === message.content && m.sender_id === message.sender_id))) {
          return prev;
        }
        return [...prev, message];
      });
      setTimeout(() => scrollToBottom(), 50);
    });

    socket.on('user_typing', ({ userName, isTyping }) => {
      if (isTyping) {
        setTypingUser(userName);
      } else {
        setTypingUser(null);
      }
    });

    fetchTeams();

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/chat/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTeams(data.teams);
        if (data.teams.length > 0) {
          selectTeam(data.teams[0]);
        }
      } else {
        useFallbackTeams();
      }
    } catch (err) {
      useFallbackTeams();
    }
  };

  const useFallbackTeams = () => {
    const mock = [
      { id: 1, name: '#general-engineering', description: 'General engineering discussion and sprint announcements' },
      { id: 2, name: '#devops-infra', description: 'CI/CD pipelines, Kubernetes clusters, and AWS infrastructure' },
      { id: 3, name: '#frontend-ui', description: 'React, Tailwind CSS v4, and design system discussions' }
    ];
    setTeams(mock);
    selectTeam(mock[0], true);
  };

  const selectTeam = async (team, isMock = false) => {
    setActiveTeam(team);
    socket.emit('join_team', team.id);

    if (isMock) {
      setMessages([
        { id: 1, sender_id: 1, sender_name: 'Alex Mercer', sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', content: 'Hey team! Welcome to the new DevOS real-time chat platform 🚀', created_at: '2 hours ago' },
        { id: 2, sender_id: 2, sender_name: 'Elena Rostova', sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', content: 'Awesome! I am setting up the AWS ECS deployment pipeline right now 💻✨', created_at: '1 hour ago' },
        { id: 3, sender_id: 1, sender_name: 'Alex Mercer', sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', content: 'Sounds perfect Elena. Let me know if you need any environment variables configured 👍', created_at: 'Just now' }
      ]);
      setTimeout(() => scrollToBottom(), 50);
      return;
    }

    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`http://localhost:5000/api/chat/teams/${team.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.messages);
      } else {
        setMessages([
          { id: 1, sender_id: 1, sender_name: 'Alex Mercer', sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', content: 'Hey team! Welcome to the new DevOS real-time chat platform 🚀', created_at: '2 hours ago' },
          { id: 2, sender_id: 2, sender_name: 'Elena Rostova', sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', content: 'Awesome! I am setting up the AWS ECS deployment pipeline right now 💻✨', created_at: '1 hour ago' }
        ]);
      }
    } catch (err) {
      setMessages([
        { id: 1, sender_id: 1, sender_name: 'Alex Mercer', sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', content: 'Hey team! Welcome to the new DevOS real-time chat platform 🚀', created_at: '2 hours ago' }
      ]);
    }
    setTimeout(() => scrollToBottom(), 50);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (activeTeam && user) {
      socket.emit('typing', { teamId: activeTeam.id, userName: user.name, isTyping: e.target.value.length > 0 });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTeam) return;

    const fullMsg = {
      id: Date.now(),
      sender_id: user?.id || 1,
      team_id: activeTeam.id,
      content: newMessage.trim(),
      sender_name: user?.name || 'Alex Mercer',
      sender_avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: 'Just now'
    };

    // Optimistic UI Update: Instantly show message to the sender
    setMessages(prev => [...prev, fullMsg]);
    setTimeout(() => scrollToBottom(), 50);

    // Broadcast to other users in the room
    if (socket && socket.connected) {
      socket.emit('send_message', fullMsg);
      socket.emit('typing', { teamId: activeTeam.id, userName: user?.name || 'Alex Mercer', isTyping: false });
    }
    
    setNewMessage('');
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName) return;
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/chat/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTeamName, description: newTeamDesc })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTeams([...teams, data.team]);
        selectTeam(data.team);
      } else {
        const t = { id: Date.now(), name: newTeamName.startsWith('#') ? newTeamName : `#${newTeamName}`, description: newTeamDesc };
        setTeams([...teams, t]);
        selectTeam(t, true);
      }
    } catch (err) {
      const t = { id: Date.now(), name: newTeamName.startsWith('#') ? newTeamName : `#${newTeamName}`, description: newTeamDesc };
      setTeams([...teams, t]);
      selectTeam(t, true);
    }
    setNewTeamName('');
    setNewTeamDesc('');
    setShowAddModal(false);
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fadeIn h-full flex flex-col gap-6 min-h-[600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-400" />
            <span>Real-Time Team Chat</span>
          </h1>
          <p className="text-slate-400 text-sm">Collaborate in group channels with live Socket.IO messaging, typing indicators, and emoji support.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Channel</span>
        </button>
      </div>

      {/* Main Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Left Sidebar: Channels & Online Users */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-6 flex flex-col gap-6 border border-slate-800 h-full overflow-hidden">
          {/* Search Channels */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search channels..."
              className="w-full h-11 rounded-xl border border-slate-800 bg-slate-900/60 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none backdrop-blur-sm"
            />
          </div>

          {/* Channels List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
              <span>Channels</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">{filteredTeams.length}</span>
            </div>
            <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {filteredTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => selectTeam(team)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left font-medium transition-all ${
                    activeTeam?.id === team.id
                      ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 border-l-4 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Hash className="h-4 w-4 flex-shrink-0 text-blue-400" />
                  <div className="truncate flex-1">
                    <div className="text-sm font-bold truncate">{team.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{team.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Online Users */}
          <div className="border-t border-slate-800/80 pt-6 flex flex-col overflow-hidden max-h-[220px]">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <span>Online Users</span>
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/20">
                {onlineUsers.length || 2}
              </span>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {(onlineUsers.length > 0 ? onlineUsers : [
                { id: 1, name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
                { id: 2, name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
              ]).map((ou, idx) => (
                <div key={ou.id || idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="relative">
                    <img src={ou.avatar} alt={ou.name} className="h-7 w-7 rounded-full object-cover border border-slate-700" />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 truncate">{ou.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Chat History & Input */}
        <div className="lg:col-span-9 glass-panel rounded-3xl border border-slate-800 h-full flex flex-col overflow-hidden shadow-2xl relative">
          {activeTeam ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Channel Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-400" />
                    <span>{activeTeam.name}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{activeTeam.description}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                  <span>Live Socket Sync</span>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-[#121318]/40">
                {messages.length === 0 ? (
                  <div className="py-20 text-center text-slate-600 text-xs font-medium italic border border-dashed border-slate-800/80 rounded-3xl">
                    No messages in this channel yet. Start the conversation below!
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id || idx} className={`flex items-start gap-3.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <img 
                          src={msg.sender_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                          alt={msg.sender_name} 
                          className="h-9 w-9 rounded-full object-cover border border-slate-700 flex-shrink-0" 
                        />
                        <div className={`space-y-1.5 max-w-xl ${isMe ? 'items-end text-right' : ''}`}>
                          <div className={`flex items-center gap-2 text-xs ${isMe ? 'justify-end' : ''}`}>
                            <span className="font-extrabold text-slate-200">{msg.sender_name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{msg.created_at || 'Just now'}</span>
                          </div>
                          <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                            isMe 
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none' 
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              {typingUser && (
                <div className="px-6 py-2 bg-slate-950/60 border-t border-slate-800/60 text-[10px] font-mono text-blue-400 italic flex items-center gap-2 animate-fadeIn">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                  </span>
                  <span>{typingUser} is typing...</span>
                </div>
              )}

              {/* Input Form & Emoji Quick Bar */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-3">
                {/* Quick Emoji Toolbar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <Smile className="h-4 w-4 text-slate-500 mr-1 flex-shrink-0" />
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm transition-transform hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={`Message ${activeTeam.name}...`}
                    className="flex-1 h-12 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all flex-shrink-0 gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-4">
              <MessageSquare className="h-16 w-16 text-slate-700 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-slate-400 mb-1">No Channel Selected</h3>
                <p className="text-xs text-slate-600 max-w-sm">Select a channel from the left sidebar or create a new group to start collaborating in real-time.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
              >
                Create Channel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-8 max-w-md w-full border border-slate-700/80 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Create Group Channel</h2>
            <form onSubmit={handleAddTeam} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Channel Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. #architecture-review"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="What is this channel about?"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
