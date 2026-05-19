import { getPool } from '../config/db.js';

export const getSnippets = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    if (!pool) {
      return res.status(200).json({
        success: true,
        snippets: [
          { id: 1, title: 'Express.js Async Error Handler', language: 'JavaScript', code_content: 'const asyncHandler = fn => (req, res, next) =>\n  Promise.resolve(fn(req, res, next)).catch(next);\n\nexport default asyncHandler;', tags: 'express, middleware, async', is_favorite: true, created_at: '2026-05-18' },
          { id: 2, title: 'Python FastAPI DB Dependency', language: 'Python', code_content: 'from fastapi import Depends\nfrom sqlalchemy.orm import Session\n\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()', tags: 'fastapi, database, python', is_favorite: true, created_at: '2026-05-17' },
          { id: 3, title: 'Java Spring Boot CORS Config', language: 'Java', code_content: '@Configuration\npublic class CorsConfig implements WebMvcConfigurer {\n    @Override\n    public void addCorsMappings(CorsRegistry registry) {\n        registry.addMapping("/**").allowedOrigins("*");\n    }\n}', tags: 'spring, cors, java', is_favorite: false, created_at: '2026-05-16' },
          { id: 4, title: 'MySQL Optimized Pagination Query', language: 'SQL', code_content: 'SELECT id, title, created_at \nFROM articles \nWHERE id > 1000 \nORDER BY id ASC \nLIMIT 50;', tags: 'mysql, performance, sql', is_favorite: false, created_at: '2026-05-15' },
          { id: 5, title: 'C++ Binary Search Tree Node', language: 'C++', code_content: 'struct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n};', tags: 'cpp, algorithms, dsa', is_favorite: false, created_at: '2026-05-14' }
        ]
      });
    }

    const [snippets] = await pool.query(`
      SELECT id, title, language, code_content, tags, is_favorite, created_at
      FROM snippets
      WHERE user_id = ?
      ORDER BY is_favorite DESC, created_at DESC
    `, [userId]);

    res.status(200).json({ success: true, snippets });
  } catch (error) {
    console.error('Get Snippets Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching snippets' });
  }
};

export const createSnippet = async (req, res) => {
  try {
    const { title, language, code_content, tags, is_favorite } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!title || !code_content || !language) {
      return res.status(400).json({ success: false, message: 'Title, language, and code content are required' });
    }

    if (!pool) {
      const newS = { id: Date.now(), title, language, code_content, tags, is_favorite: is_favorite || false, created_at: new Date() };
      return res.status(201).json({ success: true, snippet: newS });
    }

    const [result] = await pool.query(
      'INSERT INTO snippets (title, language, code_content, tags, is_favorite, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, language, code_content, tags || '', is_favorite || false, userId]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'SNIPPET_CREATED', `Created snippet: ${title}`]);

    const [newSnippet] = await pool.query('SELECT * FROM snippets WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, snippet: newSnippet[0] });
  } catch (error) {
    console.error('Create Snippet Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating snippet' });
  }
};

export const toggleFavoriteSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Favorite toggled (demo fallback)' });

    // Fetch current state
    const [snips] = await pool.query('SELECT is_favorite, title FROM snippets WHERE id = ? AND user_id = ?', [id, userId]);
    if (snips.length === 0) return res.status(404).json({ success: false, message: 'Snippet not found' });

    const newFav = !snips[0].is_favorite;
    await pool.query('UPDATE snippets SET is_favorite = ? WHERE id = ?', [newFav, id]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'SNIPPET_FAVORITED', `Toggled favorite for snippet #${id}`]);

    res.status(200).json({ success: true, is_favorite: newFav, message: newFav ? 'Added to favorites' : 'Removed from favorites' });
  } catch (error) {
    console.error('Toggle Favorite Error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling favorite' });
  }
};

export const updateSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, language, code_content, tags } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Snippet updated successfully (demo fallback)' });

    await pool.query(
      'UPDATE snippets SET title = ?, language = ?, code_content = ?, tags = ? WHERE id = ? AND user_id = ?',
      [title, language, code_content, tags, id, userId]
    );

    res.status(200).json({ success: true, message: 'Snippet updated successfully' });
  } catch (error) {
    console.error('Update Snippet Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating snippet' });
  }
};

export const deleteSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Snippet deleted successfully (demo fallback)' });

    await pool.query('DELETE FROM snippets WHERE id = ? AND user_id = ?', [id, userId]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'SNIPPET_DELETED', `Deleted snippet #${id}`]);

    res.status(200).json({ success: true, message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Delete Snippet Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting snippet' });
  }
};
