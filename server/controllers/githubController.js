import { getPool } from '../config/db.js';

export const getGithubProfile = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    if (!pool) {
      return res.status(200).json({ success: true, github_username: 'octocat' });
    }

    const [users] = await pool.query('SELECT github_username FROM users WHERE id = ?', [userId]);
    res.status(200).json({ success: true, github_username: users[0]?.github_username || null });
  } catch (error) {
    console.error('Get GitHub Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching GitHub profile' });
  }
};

export const connectGithub = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!username) return res.status(400).json({ success: false, message: 'GitHub username is required' });

    if (!pool) {
      return res.status(200).json({ success: true, github_username: username, message: 'GitHub connected successfully (demo fallback)' });
    }

    await pool.query('UPDATE users SET github_username = ? WHERE id = ?', [username, userId]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'GITHUB_CONNECTED', `Connected GitHub account: ${username}`]);

    res.status(200).json({ success: true, github_username: username, message: 'GitHub account connected successfully' });
  } catch (error) {
    console.error('Connect GitHub Error:', error);
    res.status(500).json({ success: false, message: 'Server error connecting GitHub account' });
  }
};

export const disconnectGithub = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) {
      return res.status(200).json({ success: true, github_username: null, message: 'GitHub disconnected (demo fallback)' });
    }

    await pool.query('UPDATE users SET github_username = NULL WHERE id = ?', [userId]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'GITHUB_DISCONNECTED', 'Disconnected GitHub account']);

    res.status(200).json({ success: true, github_username: null, message: 'GitHub account disconnected' });
  } catch (error) {
    console.error('Disconnect GitHub Error:', error);
    res.status(500).json({ success: false, message: 'Server error disconnecting GitHub account' });
  }
};
