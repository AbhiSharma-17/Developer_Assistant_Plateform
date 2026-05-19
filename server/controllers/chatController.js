import { getPool } from '../config/db.js';

export const getTeams = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(200).json({
        success: true,
        teams: [
          { id: 1, name: '#general-engineering', description: 'General engineering discussion and sprint announcements' },
          { id: 2, name: '#devops-infra', description: 'CI/CD pipelines, Kubernetes clusters, and AWS infrastructure' },
          { id: 3, name: '#frontend-ui', description: 'React, Tailwind CSS v4, and design system discussions' }
        ]
      });
    }

    const [teams] = await pool.query('SELECT * FROM teams ORDER BY created_at ASC');
    res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error('Get Teams Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching teams' });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!name) return res.status(400).json({ success: false, message: 'Team/Channel name is required' });

    const formattedName = name.startsWith('#') ? name : `#${name}`;

    if (!pool) {
      const newT = { id: Date.now(), name: formattedName, description, created_by: userId };
      return res.status(201).json({ success: true, team: newT });
    }

    const [result] = await pool.query('INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)', [
      formattedName, description || '', userId
    ]);

    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'TEAM_CREATED', `Created chat channel: ${formattedName}`]);

    const [newTeam] = await pool.query('SELECT * FROM teams WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, team: newTeam[0] });
  } catch (error) {
    console.error('Create Team Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating team' });
  }
};

export const getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const pool = getPool();

    if (!pool) {
      return res.status(200).json({
        success: true,
        messages: [
          { id: 1, sender_id: 1, sender_name: 'Alex Mercer', sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', content: 'Hey team! Welcome to the new DevOS real-time chat platform 🚀', created_at: '2 hours ago' },
          { id: 2, sender_id: 2, sender_name: 'Elena Rostova', sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', content: 'Awesome! I am setting up the AWS ECS deployment pipeline right now 💻✨', created_at: '1 hour ago' },
          { id: 3, sender_id: 1, sender_name: 'Alex Mercer', sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', content: 'Sounds perfect Elena. Let me know if you need any environment variables configured 👍', created_at: 'Just now' }
        ]
      });
    }

    const [messages] = await pool.query(`
      SELECT m.id, m.content, m.created_at, u.id as sender_id, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.team_id = ?
      ORDER BY m.created_at ASC
    `, [teamId]);

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Get Team Messages Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
};
