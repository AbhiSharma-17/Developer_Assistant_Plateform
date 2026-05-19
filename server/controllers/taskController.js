import { getPool } from '../config/db.js';

export const getTasks = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    if (!pool) {
      return res.status(200).json({
        success: true,
        tasks: [
          { id: 1, title: 'Implement OAuth2 Flow with GitHub', description: 'Add GitHub SSO login support', project_id: 1, project_name: 'DevOS Core', assigned_to: 1, assignee_name: 'Alex Mercer', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'In Progress', priority: 'High', due_date: 'Today', category: 'Backend', commentCount: 2 },
          { id: 2, title: 'Optimize MySQL connection pooling', description: 'Configure pool limits and timeouts', project_id: 2, project_name: 'Backend API', assigned_to: 2, assignee_name: 'Elena Rostova', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Completed', priority: 'Urgent', due_date: 'Yesterday', category: 'Database', commentCount: 1 },
          { id: 3, title: 'Design dark mode glassmorphism UI', description: 'Create beautiful Tailwind v4 theme', project_id: 1, project_name: 'DevOS Frontend', assigned_to: 1, assignee_name: 'Alex Mercer', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Completed', priority: 'High', due_date: 'May 14', category: 'Design', commentCount: 0 },
          { id: 4, title: 'Write Redis caching layer for prompts', description: 'Cache frequent AI prompt templates', project_id: 2, project_name: 'AI Service', assigned_to: 2, assignee_name: 'Elena Rostova', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Pending', priority: 'Medium', due_date: 'May 20', category: 'AI', commentCount: 3 },
          { id: 5, title: 'Setup GitHub Actions CI/CD pipeline', description: 'Automate tests and Docker builds', project_id: 1, project_name: 'DevOS Core', assigned_to: 1, assignee_name: 'Alex Mercer', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Pending', priority: 'Urgent', due_date: 'May 22', category: 'DevOps', commentCount: 1 },
        ]
      });
    }

    const [tasks] = await pool.query(`
      SELECT t.id, t.title, t.description, t.project_id, t.status, t.priority, t.due_date, t.category, t.created_at, t.updated_at,
             p.name as project_name,
             u.id as assigned_to, u.name as assignee_name, u.avatar as assignee_avatar,
             (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) as commentCount
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.user_id = ? OR t.assigned_to = ? OR p.user_id = ?
      ORDER BY t.updated_at DESC
    `, [userId, userId, userId]);

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, project_id, assigned_to, status, priority, due_date, category } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!title || !project_id) {
      return res.status(400).json({ success: false, message: 'Title and Project are required' });
    }

    if (!pool) {
      const newTask = { id: Date.now(), title, description, project_id, project_name: 'DevOS Core', assigned_to: assigned_to || userId, assignee_name: 'Alex Mercer', assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: status || 'Pending', priority: priority || 'Medium', due_date: due_date || 'Today', category: category || 'General', commentCount: 0 };
      return res.status(201).json({ success: true, task: newTask });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, project_id, user_id, assigned_to, status, priority, due_date, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, project_id, userId, assigned_to || userId, status || 'Pending', priority || 'Medium', due_date || 'Today', category || 'General']
    );

    const taskId = result.insertId;

    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'TASK_CREATED', `Created task: ${title}`]);

    const [newTask] = await pool.query(`
      SELECT t.*, p.name as project_name, u.name as assignee_name, u.avatar as assignee_avatar, 0 as commentCount
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = ?
    `, [taskId]);

    res.status(201).json({ success: true, task: newTask[0] });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating task' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) {
      return res.status(200).json({ success: true, message: 'Task status updated (demo fallback)' });
    }

    await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'TASK_STATUS_UPDATED', `Updated task #${id} status to ${status}`]);

    res.status(200).json({ success: true, message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Update Task Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating task status' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, project_id, assigned_to, status, priority, due_date, category } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Task updated successfully (demo fallback)' });

    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, project_id = ?, assigned_to = ?, status = ?, priority = ?, due_date = ?, category = ? WHERE id = ?',
      [title, description, project_id, assigned_to, status, priority, due_date, category, id]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'TASK_UPDATED', `Updated task: ${title}`]);

    res.status(200).json({ success: true, message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Task deleted successfully (demo fallback)' });

    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'TASK_DELETED', `Deleted task #${id}`]);

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
};

export const getTaskComments = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    if (!pool) {
      return res.status(200).json({
        success: true,
        comments: [
          { id: 1, user_id: 2, user_name: 'Elena Rostova', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', comment: 'Looks great! Let me know if you need help with the CI/CD pipeline.', created_at: '2 hours ago' },
          { id: 2, user_id: 1, user_name: 'Alex Mercer', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', comment: 'Thanks Elena! I will push the initial GitHub Actions workflow shortly.', created_at: '1 hour ago' }
        ]
      });
    }

    const [comments] = await pool.query(`
      SELECT tc.id, tc.comment, tc.created_at, u.id as user_id, u.name as user_name, u.avatar as user_avatar
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at ASC
    `, [id]);

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error('Get Task Comments Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching task comments' });
  }
};

export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!comment) return res.status(400).json({ success: false, message: 'Comment text is required' });

    if (!pool) {
      const newC = { id: Date.now(), user_id: userId, user_name: 'Alex Mercer', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', comment, created_at: 'Just now' };
      return res.status(201).json({ success: true, comment: newC });
    }

    const [result] = await pool.query('INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)', [id, userId, comment]);
    
    const [newComment] = await pool.query(`
      SELECT tc.id, tc.comment, tc.created_at, u.id as user_id, u.name as user_name, u.avatar as user_avatar
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.id = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, comment: newComment[0] });
  } catch (error) {
    console.error('Add Task Comment Error:', error);
    res.status(500).json({ success: false, message: 'Server error adding task comment' });
  }
};
