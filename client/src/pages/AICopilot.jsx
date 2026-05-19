import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Zap, Send, Code, Bug, Database, FileText, GitCommit, Copy, CheckCircle2, 
  Sparkles, Terminal, RefreshCw, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AICopilot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "### 🤖 DevOS AI Copilot Online\n\nWelcome to your intelligent coding assistant! Select a specialized operating mode from the left sidebar or ask me anything directly.\n\n#### ⚡ Quick Actions Available:\n- **Code Explanation**: Paste complex logic for an architectural breakdown.\n- **Bug Explanation**: Paste stacktraces to diagnose root causes.\n- **SQL Generator**: Describe schemas in natural language for optimized queries.\n- **Docs Generator**: Generate clean markdown specifications.\n- **Commit Generator**: Create Conventional Commit messages instantly.",
      timestamp: 'Just now',
      mode: 'general_chat'
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [contextCode, setContextCode] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [activeMode, setActiveMode] = useState('general_chat'); // 'general_chat', 'explain_code', 'explain_bug', 'generate_sql', 'generate_docs', 'generate_commit'
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const modes = [
    { id: 'general_chat', name: 'General Chat', icon: MessageSquare, desc: 'Ask general programming questions or discuss system design.' },
    { id: 'explain_code', name: 'Code Explanation', icon: Code, desc: 'Paste complex functions or algorithms for a line-by-line breakdown.' },
    { id: 'explain_bug', name: 'Bug Explanation', icon: Bug, desc: 'Paste error stacktraces or unexpected behavior to diagnose root causes.' },
    { id: 'generate_sql', name: 'SQL Generator', icon: Database, desc: 'Describe table relationships in natural language for optimized MySQL queries.' },
    { id: 'generate_docs', name: 'Docs Generator', icon: FileText, desc: 'Generate enterprise-grade markdown documentation and API specs.' },
    { id: 'generate_commit', name: 'Commit Generator', icon: GitCommit, desc: 'Create Conventional Commit messages based on your recent git diffs.' },
  ];

  const suggestedPrompts = {
    general_chat: [
      "Explain how async/await works under the hood in V8 engine",
      "Compare Apollo Federation v2 against Schema Stitching",
      "What are the best practices for structuring a large scale React app?"
    ],
    explain_code: [
      "const debounce = (fn, d) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), d); } };",
      "function fibMemo(n, memo = {}) { if (n in memo) return memo[n]; if (n <= 2) return 1; return memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo); }",
      "app.use((err, req, res, next) => { res.status(err.status || 500).json({ error: err.message }); });"
    ],
    explain_bug: [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')",
      "UnhandledPromiseRejectionWarning: Error: ER_LOCK_DEADLOCK: Deadlock found when trying to get lock; try restarting transaction",
      "Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak."
    ],
    generate_sql: [
      "Create a query to find the top 5 developers with the most completed tasks in the last 30 days",
      "Generate a recursive CTE query to display employee management hierarchy",
      "Write an optimized query joining projects, tasks, and users with indexing recommendations"
    ],
    generate_docs: [
      "Authentication Middleware using JWT Bearer tokens with automated refresh rotation",
      "Redis Caching Layer for GraphQL Subgraph Entity Resolution",
      "Tailwind CSS v4 Glassmorphism UI Component Library Specification"
    ],
    generate_commit: [
      "fix JWT token expiration check and add automated refresh rotation in auth middleware",
      "optimize MySQL query indexing for project dashboard statistics to reduce load time by 40%",
      "implement Socket.IO real-time team chat channels with unread badge ping notifications"
    ]
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: prompt,
      contextCode: contextCode.trim() ? contextCode : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: activeMode
    };

    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: userMsg.text, mode: activeMode, contextCode: userMsg.contextCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: activeMode
        }]);
      } else {
        useFallbackResponse(userMsg);
      }
    } catch (err) {
      useFallbackResponse(userMsg);
    } finally {
      setLoading(false);
    }
  };

  const useFallbackResponse = (userMsg) => {
    let fallbackText = '';
    switch (activeMode) {
      case 'explain_code':
        fallbackText = `### 🔍 AI Code Explanation (Demo Mode)\n\nHere is a detailed breakdown of the provided code logic:\n\n\`\`\`javascript\n${userMsg.contextCode || userMsg.text}\n\`\`\`\n\n#### 💡 Core Mechanics & Execution Flow:\n1. **Initialization & Scope**: The function establishes a local execution context, binding parameters to lexical environment variables.\n2. **Asynchronous Non-Blocking I/O**: Notice the use of Promises/Async-Await. This allows the main V8 event loop to continue processing other incoming requests while waiting for background I/O operations (like database queries or network requests) to complete.\n3. **Error Handling & Resilience**: Wrapping the execution block in a \`try...catch\` block ensures that unhandled promise rejections do not crash the underlying Node.js process.\n\n#### 🚀 Optimization Suggestion:\nConsider implementing a memory caching layer (such as Redis or an in-memory Map) to avoid redundant computation for identical inputs.`;
        break;
      case 'explain_bug':
        fallbackText = `### 🐛 AI Bug Analysis & Resolution (Demo Mode)\n\nI have analyzed your error stacktrace / bug description:\n\n> "${userMsg.text}"\n\n#### 🚨 Root Cause Analysis:\nThis issue typically occurs due to a **Race Condition** or **Undefined Reference** during runtime execution. Specifically, the JavaScript engine is attempting to access a property or invoke a method on an object that has not been fully initialized or returned \`null\` from an asynchronous call.\n\n#### 🛠️ Recommended Fix:\nAdd explicit null-checks / optional chaining (\`?.\`) before accessing deeply nested properties, and ensure your asynchronous database queries use \`await\` properly.\n\n\`\`\`javascript\n// ❌ Vulnerable Code\nconst userRole = req.user.role.toLowerCase();\n\n// ✅ Robust Fixed Code\nconst userRole = req.user?.role?.toLowerCase() || 'guest';\nif (!req.user) {\n  throw new Error('Authentication payload missing');\n}\n\`\`\``;
        break;
      case 'generate_sql':
        fallbackText = `### 💾 AI SQL Query Generator (Demo Mode)\n\nBased on your natural language schema request:\n\n> "${userMsg.text}"\n\nHere is the fully optimized, normalized MySQL 8.0 query:\n\n\`\`\`sql\n-- Optimized MySQL Query with Indexing & Joins\nSELECT \n    p.id AS project_id,\n    p.name AS project_name,\n    COUNT(t.id) AS total_tasks,\n    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,\n    u.name AS project_owner\nFROM projects p\nINNER JOIN users u ON p.user_id = u.id\nLEFT JOIN tasks t ON p.id = t.project_id\nWHERE p.status = 'In Progress'\nGROUP BY p.id, u.name\nHAVING total_tasks > 0\nORDER BY completed_tasks DESC;\n\`\`\`\n\n#### ⚡ Performance Notes:\n- Uses \`INNER JOIN\` on indexed foreign keys (\`user_id\`) for maximum lookup velocity.\n- Evaluates conditional aggregate metrics using \`SUM(CASE...)\` in a single table pass.`;
        break;
      case 'generate_docs':
        fallbackText = `### 📝 AI Documentation Generator (Demo Mode)\n\nHere is the generated enterprise-grade markdown specification for your component/module:\n\n\`\`\`markdown\n# Module Specification: ${userMsg.text}\n\n## Overview\nThis module encapsulates high-performance business logic, providing a clean abstraction layer between the REST API transport controllers and underlying data persistence models.\n\n## Architecture & Design Patterns\n- **Singleton Pattern**: Ensures a single, shared database connection pool.\n- **Dependency Injection**: Decouples external services to facilitate isolated unit testing.\n\n## Usage Example\n\`\`\`javascript\nimport { initializeService } from './service.js';\n\nconst service = initializeService({ timeout: 5000 });\nawait service.executeTransaction();\n\`\`\`\n\n## Security Considerations\nAll user-supplied inputs must be sanitized using parameter binding to prevent SQL Injection vulnerabilities.\n\`\`\``;
        break;
      case 'generate_commit':
        fallbackText = `### ⚡ AI Conventional Commit Generator (Demo Mode)\n\nBased on your implementation description:\n\n> "${userMsg.text}"\n\nHere are 3 production-ready Conventional Commit messages you can use:\n\n\`\`\`bash\n# Option 1: Standard Feature\nfeat(core): implement ${userMsg.text.toLowerCase().replace(/[^a-z0-9]/g, '-')} with automated unit tests\n\n# Option 2: Bug Fix & Refactor\nfix(api): resolve race condition in ${userMsg.text.toLowerCase()} and improve error logging\n\n# Option 3: Performance Optimization\nperf(db): optimize SQL indexing for ${userMsg.text.toLowerCase()} to reduce query latency by 40%\n\`\`\`\n\n#### 💡 Best Practice:\nAlways adhere to the \`type(scope): subject\` format to ensure automated semantic versioning pipelines work seamlessly.`;
        break;
      default:
        fallbackText = `### 🤖 DevOS AI Copilot (Demo Mode)\n\nI have processed your request:\n\n> "${userMsg.text}"\n\nAs your AI pair programmer, I recommend breaking this challenge down into modular, testable components. Start by defining your core data interfaces, implement robust error handling boundaries, and verify each micro-interaction using automated test runners.\n\n\`\`\`javascript\n// AI Copilot Recommendation Scaffold\nexport async function handleDeveloperWorkflow(inputPayload) {\n  try {\n    console.log('Initializing workflow for:', inputPayload);\n    // TODO: Implement domain-specific business logic here\n    return { success: true, timestamp: new Date() };\n  } catch (error) {\n    console.error('Workflow execution failed:', error.message);\n    throw error;\n  }\n}\n\`\`\`\n\nLet me know if you would like me to generate specific SQL schemas, explain complex regex patterns, or write comprehensive unit tests for this!`;
        break;
    }

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      sender: 'ai',
      text: fallbackText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: activeMode
    }]);
  };

  const handleCopy = (text, id) => {
    // Extract code block if present
    const codeMatch = text.match(/```[a-z]*\n([\s\S]*?)\n```/);
    const contentToCopy = codeMatch ? codeMatch[1] : text;
    navigator.clipboard.writeText(contentToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleSuggestedPrompt = (sugPrompt) => {
    setPrompt(sugPrompt);
    // If mode is explain code or bug, put it in context code or prompt
    if (activeMode === 'explain_code' || activeMode === 'explain_bug') {
      setContextCode(sugPrompt);
      setPrompt(`Please analyze and explain the following ${activeMode === 'explain_code' ? 'code snippet' : 'error log'}.`);
    }
  };

  return (
    <div className="animate-fadeIn h-full flex flex-col gap-6 min-h-[600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <Bot className="h-8 w-8 text-purple-400" />
            <span>AI Copilot & Pair Programmer</span>
          </h1>
          <p className="text-slate-400 text-sm">Harness AI to explain complex logic, debug runtime stacktraces, generate optimized SQL, and author documentation.</p>
        </div>

        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2.5 rounded-2xl text-purple-300 text-xs font-semibold shadow-sm animate-scaleIn">
          <Zap className="h-4 w-4 text-purple-400 animate-pulse" />
          <span>AI Engine Active</span>
        </div>
      </div>

      {/* Main Copilot Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Left Sidebar: Specialized Operating Modes */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-6 flex flex-col gap-6 border border-slate-800 h-full overflow-hidden shadow-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Operating Modes
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {modes.map((m) => {
              const Icon = m.icon;
              const isActive = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => { setActiveMode(m.id); setPrompt(''); setContextCode(''); }}
                  className={`w-full flex items-start gap-3.5 p-4 rounded-2xl text-left transition-all group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border border-purple-500/50 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-purple-400'}`} />
                  <div className="space-y-1.5 pr-2">
                    <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                      {m.name}
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      {m.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mode Info Footer */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-blue-950/40 border border-purple-500/20 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Context Aware</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Copilot automatically tailors its response format, code snippets, and AST analysis to the active operating mode.
            </p>
          </div>
        </div>

        {/* Right Pane: Chat Feed & Intelligent Input */}
        <div className="lg:col-span-9 glass-panel rounded-3xl border border-slate-800 h-full flex flex-col overflow-hidden shadow-2xl relative">
          {/* Active Mode Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              {React.createElement(modes.find(m => m.id === activeMode)?.icon || Bot, { className: "h-6 w-6 text-purple-400" })}
              <div>
                <h2 className="text-lg font-extrabold text-white">{modes.find(m => m.id === activeMode)?.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{modes.find(m => m.id === activeMode)?.desc}</p>
              </div>
            </div>

            <button
              onClick={() => setMessages([{
                id: Date.now(),
                sender: 'ai',
                text: `### 🤖 ${modes.find(m => m.id === activeMode)?.name} Initialized\n\nI am ready to assist. Please enter your prompt or paste your code below.`,
                timestamp: 'Just now',
                mode: activeMode
              }])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
              title="Clear conversation"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-[#121318]/40">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div key={msg.id} className={`flex items-start gap-4 ${isAi ? '' : 'flex-row-reverse'}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl flex-shrink-0 shadow-sm ${
                    isAi 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : 'bg-slate-800 border border-slate-700 text-slate-300'
                  }`}>
                    {isAi ? <Bot className="h-5 w-5" /> : <Terminal className="h-5 w-5" />}
                  </div>

                  <div className={`space-y-2 max-w-3xl ${isAi ? '' : 'items-end text-right'}`}>
                    <div className={`flex items-center gap-2 text-xs ${isAi ? '' : 'justify-end'}`}>
                      <span className="font-extrabold text-slate-200">{isAi ? 'AI Copilot' : user?.name || 'Developer'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>

                    <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-sm border ${
                      isAi 
                        ? 'bg-slate-900/60 border-slate-700/50 text-slate-300 rounded-tl-none' 
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-200 rounded-tr-none'
                    }`}>
                      {/* Render text with basic markdown parsing */}
                      {msg.text.split('\n\n').map((para, pIdx) => {
                        if (para.startsWith('### ')) return <h3 key={pIdx} className="text-lg font-bold text-white border-b border-slate-800 pb-2">{para.replace('### ', '')}</h3>;
                        if (para.startsWith('#### ')) return <h4 key={pIdx} className="text-sm font-bold text-purple-400 mt-2">{para.replace('#### ', '')}</h4>;
                        if (para.startsWith('> ')) return <blockquote key={pIdx} className="border-l-4 border-purple-500 pl-4 py-1 text-slate-400 italic bg-slate-950/40 rounded-r-xl">{para.replace('> ', '')}</blockquote>;
                        if (para.startsWith('```')) {
                          const codeText = para.replace(/```[a-z]*\n/g, '').replace(/\n```/g, '');
                          return (
                            <div key={pIdx} className="relative group my-4">
                              <div className="absolute right-3 top-3 z-10">
                                <button
                                  onClick={() => handleCopy(para, msg.id + '-' + pIdx)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 text-xs font-semibold border border-slate-700 hover:border-purple-500/40 transition-all shadow-sm"
                                >
                                  {copiedId === (msg.id + '-' + pIdx) ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                  <span>{copiedId === (msg.id + '-' + pIdx) ? 'Copied Code!' : 'Copy Code'}</span>
                                </button>
                              </div>
                              <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto text-purple-300 shadow-inner leading-relaxed">
                                {codeText}
                              </pre>
                            </div>
                          );
                        }
                        if (para.startsWith('- ')) return (
                          <ul key={pIdx} className="list-disc list-inside space-y-1.5 text-slate-300 ml-2 my-2">
                            {para.split('\n').map((li, lIdx) => <li key={lIdx}>{li.replace('- ', '')}</li>)}
                          </ul>
                        );
                        return <p key={pIdx} className="text-sm leading-relaxed">{para}</p>;
                      })}
                    </div>

                    {/* Context Code Snippet attached to User Message */}
                    {msg.contextCode && !isAi && (
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left font-mono text-xs text-slate-400 max-w-xl overflow-x-auto">
                        <div className="text-[10px] text-purple-400 font-bold uppercase mb-1 flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          <span>Attached Context</span>
                        </div>
                        <pre>{msg.contextCode}</pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-4 animate-fadeIn">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 border border-purple-500/40 text-white shadow-lg shadow-purple-500/20 animate-pulse flex-shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 text-sm text-slate-400 italic flex items-center gap-3 shadow-xl">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span>AI Copilot is analyzing your request and synthesizing expert context...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area & Suggested Prompts Bar */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
            {/* Suggested Prompts Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 flex-shrink-0 mr-1">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Suggestions:</span>
              </span>
              {suggestedPrompts[activeMode]?.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestedPrompt(sug)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-500/40 text-xs font-medium transition-all flex-shrink-0 truncate max-w-xs shadow-sm"
                  title={sug}
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Expandable Context Code / Stacktrace Area */}
            {showContext && (
              <div className="animate-scaleIn">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center justify-between">
                  <span>Paste Context Code / Error Stacktrace</span>
                  <button onClick={() => setShowContext(false)} className="text-slate-500 hover:text-slate-300 text-[10px]">Close</button>
                </label>
                <textarea
                  rows={4}
                  value={contextCode}
                  onChange={(e) => setContextCode(e.target.value)}
                  placeholder="Paste your vulnerable JavaScript functions, SQL schemas, or runtime error stacktraces here..."
                  className="w-full rounded-2xl border border-purple-500/30 bg-slate-900/90 p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none custom-scrollbar"
                />
              </div>
            )}

            {/* Main Prompt Input Form */}
            <form onSubmit={handleSend} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Ask AI Copilot (${modes.find(m => m.id === activeMode)?.name})... (Press Enter to send)`}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 p-4 pr-12 text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none custom-scrollbar leading-relaxed"
                />
                {!showContext && (
                  <button
                    type="button"
                    onClick={() => setShowContext(true)}
                    className="absolute right-3 top-3 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-purple-300 transition-colors"
                    title="Attach Context Code or Error Stacktrace"
                  >
                    <Code className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="flex items-center justify-center h-14 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm hover:opacity-95 disabled:opacity-50 shadow-sm transition-all flex-shrink-0 gap-2 border border-purple-500/50"
              >
                <Send className="h-5 w-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
