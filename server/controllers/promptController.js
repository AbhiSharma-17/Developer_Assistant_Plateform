import { getPool } from '../config/db.js';

export const getPrompts = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    if (!pool) {
      return res.status(200).json({
        success: true,
        prompts: [
          { id: 1, title: 'Senior Code Reviewer & Refactorer', category: 'Coding', prompt_text: 'Act as an elite Senior Full-Stack Software Engineer. Review the following code snippet for security vulnerabilities, time/space complexity bottlenecks, and clean code principles. Provide a refactored version with robust comments explaining your architectural decisions.', tags: 'codereview, refactor, clean-code', is_favorite: true, is_public: true, created_at: '2026-05-18' },
          { id: 2, title: 'Advanced MySQL Query Optimizer', category: 'SQL', prompt_text: 'Analyze the following SQL query and schema. Identify missing composite indexes, subquery bottlenecks, and potential deadlocks. Rewrite the query using JOINs or window functions for maximum performance on a table with 10M+ rows.', tags: 'mysql, indexing, performance', is_favorite: true, is_public: true, created_at: '2026-05-17' },
          { id: 3, title: 'Tailwind CSS v4 Glassmorphism Theme', category: 'UI Design', prompt_text: 'Generate a modern, premium dark mode UI component using Tailwind CSS v4. Incorporate glassmorphism utilities (backdrop-blur, border-slate-800/80), smooth HSL gradients, and subtle micro-animations. Ensure perfect mobile responsiveness.', tags: 'tailwind, ui, darkmode, glassmorphism', is_favorite: false, is_public: true, created_at: '2026-05-16' },
          { id: 4, title: 'GitHub Actions CI/CD Docker Pipeline', category: 'Automation', prompt_text: 'Create a complete GitHub Actions workflow YAML file for a multi-stage Docker build. Include caching for npm dependencies, parallel linting/testing jobs, and automated push to AWS ECR upon successful merge to the main branch.', tags: 'cicd, docker, devops, github-actions', is_favorite: false, is_public: false, created_at: '2026-05-15' },
          { id: 5, title: 'REST API OpenAPI 3.0 Specification', category: 'Documentation', prompt_text: 'Draft a comprehensive OpenAPI 3.0 YAML specification for an enterprise authentication and user management service. Include request/response schemas for /register, /login, and /me, along with JWT security definitions and standard error codes (400, 401, 403, 500).', tags: 'openapi, swagger, api, docs', is_favorite: false, is_public: true, created_at: '2026-05-14' }
        ]
      });
    }

    const [prompts] = await pool.query(`
      SELECT id, title, category, prompt_text, tags, is_favorite, is_public, created_at, user_id
      FROM prompts
      WHERE user_id = ? OR is_public = TRUE
      ORDER BY is_favorite DESC, created_at DESC
    `, [userId]);

    res.status(200).json({ success: true, prompts });
  } catch (error) {
    console.error('Get Prompts Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching prompts' });
  }
};

export const createPrompt = async (req, res) => {
  try {
    const { title, category, prompt_text, tags, is_favorite, is_public } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!title || !prompt_text || !category) {
      return res.status(400).json({ success: false, message: 'Title, category, and prompt text are required' });
    }

    if (!pool) {
      const newP = { id: Date.now(), title, category, prompt_text, tags, is_favorite: is_favorite || false, is_public: is_public !== undefined ? is_public : true, created_at: new Date(), user_id: userId };
      return res.status(201).json({ success: true, prompt: newP });
    }

    const [result] = await pool.query(
      'INSERT INTO prompts (title, category, prompt_text, tags, is_favorite, is_public, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, category, prompt_text, tags || '', is_favorite || false, is_public !== undefined ? is_public : true, userId]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'PROMPT_CREATED', `Created AI prompt: ${title}`]);

    const [newPrompt] = await pool.query('SELECT * FROM prompts WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, prompt: newPrompt[0] });
  } catch (error) {
    console.error('Create Prompt Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating prompt' });
  }
};

export const toggleFavoritePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Prompt favorite toggled (demo fallback)' });

    const [p] = await pool.query('SELECT is_favorite FROM prompts WHERE id = ? AND user_id = ?', [id, userId]);
    if (p.length === 0) return res.status(404).json({ success: false, message: 'Prompt not found or unauthorized' });

    const newFav = !p[0].is_favorite;
    await pool.query('UPDATE prompts SET is_favorite = ? WHERE id = ?', [newFav, id]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'PROMPT_FAVORITED', `Toggled favorite for prompt #${id}`]);

    res.status(200).json({ success: true, is_favorite: newFav, message: newFav ? 'Added to favorites' : 'Removed from favorites' });
  } catch (error) {
    console.error('Toggle Favorite Prompt Error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling favorite' });
  }
};

export const togglePublicPrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Prompt visibility toggled (demo fallback)' });

    const [p] = await pool.query('SELECT is_public FROM prompts WHERE id = ? AND user_id = ?', [id, userId]);
    if (p.length === 0) return res.status(404).json({ success: false, message: 'Prompt not found or unauthorized' });

    const newPub = !p[0].is_public;
    await pool.query('UPDATE prompts SET is_public = ? WHERE id = ?', [newPub, id]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'PROMPT_VISIBILITY_CHANGED', `Changed visibility for prompt #${id} to ${newPub ? 'Public' : 'Private'}`]);

    res.status(200).json({ success: true, is_public: newPub, message: newPub ? 'Prompt is now Public' : 'Prompt is now Private' });
  } catch (error) {
    console.error('Toggle Public Prompt Error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling prompt visibility' });
  }
};

export const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, prompt_text, tags, is_public } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Prompt updated successfully (demo fallback)' });

    await pool.query(
      'UPDATE prompts SET title = ?, category = ?, prompt_text = ?, tags = ?, is_public = ? WHERE id = ? AND user_id = ?',
      [title, category, prompt_text, tags, is_public !== undefined ? is_public : true, id, userId]
    );

    res.status(200).json({ success: true, message: 'Prompt updated successfully' });
  } catch (error) {
    console.error('Update Prompt Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating prompt' });
  }
};

export const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Prompt deleted successfully (demo fallback)' });

    await pool.query('DELETE FROM prompts WHERE id = ? AND user_id = ?', [id, userId]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'PROMPT_DELETED', `Deleted AI prompt #${id}`]);

    res.status(200).json({ success: true, message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Delete Prompt Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting prompt' });
  }
};
