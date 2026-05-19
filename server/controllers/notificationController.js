import { getPool } from '../config/db.js';

export const getNotifications = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    if (!pool) {
      return res.status(200).json({
        success: true,
        notifications: [
          { id: 1, title: 'Task Assigned', message: 'Elena assigned you to "Implement OAuth2 Flow with GitHub"', type: 'task', is_read: false, created_at: '10 mins ago' },
          { id: 2, title: 'Deadline Reminder', message: 'Sprint 1 Deadline is tomorrow at 5:00 PM UTC ⏰', type: 'deadline', is_read: false, created_at: '1 hour ago' },
          { id: 3, title: 'Team Mention', message: 'Elena mentioned you in #devops-infra: "@alex check the new Dockerfile config"', type: 'mention', is_read: false, created_at: '2 hours ago' },
          { id: 4, title: 'Project Invitation', message: 'You have been invited to collaborate on "GraphQL API Gateway"', type: 'invite', is_read: true, created_at: '1 day ago' }
        ]
      });
    }

    const [notifications] = await pool.query(`
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) return res.status(200).json({ success: true, message: 'Notifications marked as read (demo fallback)' });

    if (id === 'all') {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    } else {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
    }

    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark As Read Error:', error);
    res.status(500).json({ success: false, message: 'Server error marking notifications as read' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    const pool = getPool();

    if (!pool) return res.status(201).json({ success: true, message: 'Notification created (demo fallback)' });

    await pool.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [
      user_id, title, message, type || 'info'
    ]);

    res.status(201).json({ success: true, message: 'Notification created successfully' });
  } catch (error) {
    console.error('Create Notification Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating notification' });
  }
};
