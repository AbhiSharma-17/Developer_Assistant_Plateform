import { getPool } from '../config/db.js';

export const getNotes = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    if (!pool) {
      return res.status(200).json({
        success: true,
        notes: [
          { id: 1, title: 'DevOS System Architecture v1', category: 'Architecture', content: '# DevOS System Architecture\n\nWelcome to the official documentation for DevOS. This document outlines our high-level system design, database schemas, and microservice communication protocols.\n\n## 1. Core Stack\n- **Frontend**: React.js + Tailwind CSS v4\n- **Backend**: Node.js + Express.js\n- **Database**: MySQL 8.0 (InnoDB Pool)\n\n## 2. Authentication Flow\nWe utilize stateless JSON Web Tokens (JWT) signed with HMAC SHA256. Tokens are stored securely in client storage and passed via Bearer Authorization headers.\n\n```javascript\n// Middleware verify example\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);\n```\n\n## 3. Deployment Strategy\nAutomated multi-stage Docker builds deployed to AWS ECS with Application Load Balancers.', tags: 'architecture, system, docs', updated_at: '2026-05-18' },
          { id: 2, title: 'GraphQL Federation Guidelines', category: 'API Specs', content: '# GraphQL Federation Architecture\n\nThis guide establishes the standards for building subgraphs within the DevOS ecosystem.\n\n## Subgraph Requirements\n1. Must implement Apollo Federation v2 spec.\n2. Must extend the `@key` directive for Entity resolution.\n3. Keep resolvers lightweight and offload heavy processing to background workers.\n\n```graphql\ntype User @key(fields: "id") {\n  id: ID!\n  name: String!\n  projects: [Project]\n}\n```', tags: 'graphql, api, federation', updated_at: '2026-05-17' },
          { id: 3, title: 'Tailwind CSS v4 Design Tokens', category: 'Frontend', content: '# Tailwind CSS v4 Design Tokens\n\nOur design system is built upon glassmorphism principles and vibrant HSL gradients.\n\n### Glass Panels\nUse `backdrop-blur-md bg-slate-900/60 border border-slate-800/80` for standard cards.\n\n### Typography\nPrimary font family is **Inter** with fallback to system sans-serif.', tags: 'tailwind, css, design-system', updated_at: '2026-05-16' }
        ]
      });
    }

    const [notes] = await pool.query(`
      SELECT id, title, category, content, tags, updated_at, created_at
      FROM notes
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `, [userId]);

    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error('Get Notes Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notes' });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) {
      return res.status(200).json({
        success: true,
        note: { id: 1, title: 'DevOS System Architecture v1', category: 'Architecture', content: '# DevOS System Architecture\n\nWelcome to the official documentation for DevOS. This document outlines our high-level system design, database schemas, and microservice communication protocols.\n\n## 1. Core Stack\n- **Frontend**: React.js + Tailwind CSS v4\n- **Backend**: Node.js + Express.js\n- **Database**: MySQL 8.0 (InnoDB Pool)\n\n## 2. Authentication Flow\nWe utilize stateless JSON Web Tokens (JWT) signed with HMAC SHA256. Tokens are stored securely in client storage and passed via Bearer Authorization headers.\n\n```javascript\n// Middleware verify example\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);\n```\n\n## 3. Deployment Strategy\nAutomated multi-stage Docker builds deployed to AWS ECS with Application Load Balancers.', tags: 'architecture, system, docs', updated_at: '2026-05-18' },
        versions: [
          { id: 2, title: 'DevOS System Architecture v1', content: '# DevOS System Architecture\n\nWelcome to the official documentation for DevOS...', version_number: 2, created_at: 'Just now' },
          { id: 1, title: 'DevOS System Architecture v1', content: '# DevOS System Architecture\n\nWelcome to the official documentation for DevOS...\n\n*(Initial Draft)*', version_number: 1, created_at: '2 hours ago' }
        ]
      });
    }

    const [notes] = await pool.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    if (notes.length === 0) return res.status(404).json({ success: false, message: 'Note not found' });

    const [versions] = await pool.query('SELECT * FROM note_versions WHERE note_id = ? ORDER BY version_number DESC', [id]);

    res.status(200).json({ success: true, note: notes[0], versions });
  } catch (error) {
    console.error('Get Note By Id Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching note details' });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, category, content, tags } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: 'Title, category, and content are required' });
    }

    if (!pool) {
      const newN = { id: Date.now(), title, category, content, tags, updated_at: new Date() };
      return res.status(201).json({ success: true, note: newN });
    }

    const [result] = await pool.query(
      'INSERT INTO notes (title, category, content, tags, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, category, content, tags || '', userId]
    );

    const noteId = result.insertId;

    // Create initial version
    await pool.query('INSERT INTO note_versions (note_id, title, content, version_number) VALUES (?, ?, ?, ?)', [
      noteId, title, content, 1
    ]);

    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'NOTE_CREATED', `Created documentation note: ${title}`]);

    const [newNote] = await pool.query('SELECT * FROM notes WHERE id = ?', [noteId]);

    res.status(201).json({ success: true, note: newNote[0] });
  } catch (error) {
    console.error('Create Note Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating note' });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, content, tags } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Note updated successfully (demo fallback)' });

    // Verify ownership
    const [notes] = await pool.query('SELECT id FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    if (notes.length === 0) return res.status(403).json({ success: false, message: 'Not authorized to update this note' });

    await pool.query(
      'UPDATE notes SET title = ?, category = ?, content = ?, tags = ? WHERE id = ?',
      [title, category, content, tags, id]
    );

    // Get max version number
    const [vers] = await pool.query('SELECT MAX(version_number) as maxVer FROM note_versions WHERE note_id = ?', [id]);
    const nextVer = (vers[0].maxVer || 0) + 1;

    await pool.query('INSERT INTO note_versions (note_id, title, content, version_number) VALUES (?, ?, ?, ?)', [
      id, title, content, nextVer
    ]);

    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'NOTE_UPDATED', `Updated documentation note: ${title} (v${nextVer})`]);

    res.status(200).json({ success: true, message: `Note updated to v${nextVer} successfully` });
  } catch (error) {
    console.error('Update Note Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating note' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Note deleted successfully (demo fallback)' });

    await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'NOTE_DELETED', `Deleted documentation note #${id}`]);

    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete Note Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting note' });
  }
};
