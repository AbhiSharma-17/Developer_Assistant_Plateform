import { getPool } from '../config/db.js';

export const globalSearch = async (req, res) => {
  try {
    const { q, filter } = req.query;
    const userId = req.user.id;
    const pool = getPool();

    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, results: [] });
    }

    const searchTerm = `%${q.trim()}%`;
    const activeFilter = (filter || 'all').toLowerCase();

    if (!pool) {
      // Demo Fallback Mode
      const mockAll = [
        { id: 1, title: 'DevOS System Architecture v1', preview: '# DevOS System Architecture\nWelcome to the official documentation for DevOS...', type: 'note', meta: 'Architecture', url: '/notes' },
        { id: 2, title: 'Implement OAuth2 Flow with GitHub', preview: 'Setup passport.js or manual OAuth2 token exchange with GitHub REST API', type: 'task', meta: 'Pending', url: '/tasks' },
        { id: 3, title: 'GraphQL API Gateway', preview: 'Apollo Federation v2 gateway with automated Redis caching and JWT authentication.', type: 'project', meta: 'In Progress', url: '/projects' },
        { id: 4, title: 'Express JWT Authentication Middleware', preview: 'const protect = async (req, res, next) => { const token = req.headers.authorization?.split(" ")[1]; ... }', type: 'snippet', meta: 'JavaScript', url: '/snippets' },
        { id: 5, title: 'System Architect Persona Prompt', preview: 'You are an elite Enterprise System Architect. Design highly scalable, fault-tolerant microservices...', type: 'prompt', meta: 'Coding', url: '/prompts' }
      ];

      const filtered = mockAll.filter(item => {
        const matchesQ = item.title.toLowerCase().includes(q.toLowerCase()) || item.preview.toLowerCase().includes(q.toLowerCase());
        const matchesF = activeFilter === 'all' || item.type === activeFilter.replace('s', ''); // simple singular check
        return matchesQ && matchesF;
      });

      return res.status(200).json({ success: true, results: filtered });
    }

    let results = [];

    // 1. Search Projects
    if (activeFilter === 'all' || activeFilter === 'projects') {
      const [projects] = await pool.query(`
        SELECT id, name as title, description as preview, 'project' as type, status as meta, '/projects' as url
        FROM projects
        WHERE user_id = ? AND (name LIKE ? OR description LIKE ?)
        LIMIT 10
      `, [userId, searchTerm, searchTerm]);
      results.push(...projects);
    }

    // 2. Search Tasks
    if (activeFilter === 'all' || activeFilter === 'tasks') {
      const [tasks] = await pool.query(`
        SELECT id, title, description as preview, 'task' as type, status as meta, '/tasks' as url
        FROM tasks
        WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)
        LIMIT 10
      `, [userId, searchTerm, searchTerm]);
      results.push(...tasks);
    }

    // 3. Search Notes
    if (activeFilter === 'all' || activeFilter === 'notes') {
      const [notes] = await pool.query(`
        SELECT id, title, content as preview, 'note' as type, category as meta, '/notes' as url
        FROM notes
        WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
        LIMIT 10
      `, [userId, searchTerm, searchTerm]);
      results.push(...notes);
    }

    // 4. Search Snippets
    if (activeFilter === 'all' || activeFilter === 'snippets') {
      const [snippets] = await pool.query(`
        SELECT id, title, code_content as preview, 'snippet' as type, language as meta, '/snippets' as url
        FROM snippets
        WHERE user_id = ? AND (title LIKE ? OR code_content LIKE ?)
        LIMIT 10
      `, [userId, searchTerm, searchTerm]);
      results.push(...snippets);
    }

    // 5. Search Prompts
    if (activeFilter === 'all' || activeFilter === 'prompts') {
      const [prompts] = await pool.query(`
        SELECT id, title, prompt_text as preview, 'prompt' as type, category as meta, '/prompts' as url
        FROM prompts
        WHERE user_id = ? AND (title LIKE ? OR prompt_text LIKE ?)
        LIMIT 10
      `, [userId, searchTerm, searchTerm]);
      results.push(...prompts);
    }

    // Sort combined results by title match first, then preview
    results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(q.toLowerCase());
      const bTitleMatch = b.title.toLowerCase().includes(q.toLowerCase());
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      return 0;
    });

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({ success: false, message: 'Server error performing global search' });
  }
};
