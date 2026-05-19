import { getPool } from '../config/db.js';

export const getActivityLogs = async (req, res) => {
  try {
    const pool = getPool();
    const { filter, page = 1, limit = 10 } = req.query;
    let activeFilter = (filter || 'all').toUpperCase();
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    if (!pool) {
      // Demo Fallback Mode
      const mockLogs = [
        { id: 101, user_id: 1, name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'USER_LOGIN', description: 'User authenticated successfully via JWT Bearer Token', ip_address: '192.168.1.42', created_at: '2026-05-18T21:10:00Z' },
        { id: 102, user_id: 1, name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'TASK_UPDATED', description: 'Updated task "Implement OAuth2 Flow with GitHub" status to In Progress', ip_address: '192.168.1.42', created_at: '2026-05-18T20:45:00Z' },
        { id: 103, user_id: 2, name: 'Elena Rostova', role: 'Lead DevOps Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'PROJECT_CREATED', description: 'Created new enterprise project "GraphQL API Gateway"', ip_address: '10.0.0.15', created_at: '2026-05-18T19:30:00Z' },
        { id: 104, user_id: 2, name: 'Elena Rostova', role: 'Lead DevOps Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'FILE_UPLOADED', description: 'Uploaded system architecture diagram "gateway-spec.pdf" (4.2 MB)', ip_address: '10.0.0.15', created_at: '2026-05-18T18:15:00Z' },
        { id: 105, user_id: 1, name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'TEAM_JOINED', description: 'Joined discussion channel #devops-infra', ip_address: '192.168.1.42', created_at: '2026-05-18T17:00:00Z' },
        { id: 106, user_id: 1, name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', action: 'AI_ASSISTANT_USED', description: 'Used AI Copilot: explain_bug for TypeError stacktrace', ip_address: '192.168.1.42', created_at: '2026-05-18T16:20:00Z' }
      ];

      const filtered = activeFilter === 'ALL' ? mockLogs : mockLogs.filter(l => l.action.includes(activeFilter) || (activeFilter === 'FILES' && l.action.includes('FILE')) || (activeFilter === 'TEAMS' && l.action.includes('TEAM')));
      const paginated = filtered.slice(offset, offset + limitNum);
      return res.status(200).json({ success: true, logs: paginated, total: filtered.length, page: pageNum, totalPages: Math.ceil(filtered.length / limitNum) });
    }

    let countQuery = 'SELECT COUNT(*) as total FROM activity_logs a';
    let queryStr = `
      SELECT a.id, a.user_id, a.action, a.description, a.ip_address, a.created_at, 
             u.name, u.avatar, u.role
      FROM activity_logs a
      INNER JOIN users u ON a.user_id = u.id
    `;
    let params = [];

    if (activeFilter !== 'ALL') {
      let whereClause = '';
      if (activeFilter === 'LOGINS') { whereClause = ' WHERE a.action LIKE ?'; params.push('%LOGIN%'); }
      else if (activeFilter === 'TASKS') { whereClause = ' WHERE a.action LIKE ?'; params.push('%TASK%'); }
      else if (activeFilter === 'PROJECTS') { whereClause = ' WHERE a.action LIKE ?'; params.push('%PROJECT%'); }
      else if (activeFilter === 'FILES') { whereClause = ' WHERE a.action LIKE ?'; params.push('%FILE%'); }
      else if (activeFilter === 'TEAMS') { whereClause = ' WHERE a.action LIKE ?'; params.push('%TEAM%'); }
      else if (activeFilter === 'AI') { whereClause = ' WHERE a.action LIKE ?'; params.push('%AI%'); }
      else { whereClause = ' WHERE a.action LIKE ?'; params.push(`%${activeFilter}%`); }

      countQuery += whereClause;
      queryStr += whereClause;
    }

    queryStr += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    const queryParams = [...params, limitNum, offset];

    const [countRes] = await pool.query(countQuery, params);
    const total = countRes[0].total;
    const totalPages = Math.ceil(total / limitNum);

    const [logs] = await pool.query(queryStr, queryParams);

    res.status(200).json({ success: true, logs, total, page: pageNum, totalPages });
  } catch (error) {
    console.error('Get Activity Logs Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching activity logs' });
  }
};

export const logActivityEvent = async (req, res) => {
  try {
    const pool = getPool();
    const { action, description } = req.body;
    const userId = req.user.id;
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

    if (!action) return res.status(400).json({ success: false, message: 'Action is required' });

    if (pool) {
      await pool.query('INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)', [
        userId, action, description || '', ipAddress
      ]);
    }

    res.status(200).json({ success: true, message: 'Activity logged successfully' });
  } catch (error) {
    console.error('Log Activity Error:', error);
    res.status(500).json({ success: false, message: 'Server error logging activity event' });
  }
};
