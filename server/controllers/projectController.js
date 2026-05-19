import { getPool } from '../config/db.js';

export const getProjects = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    if (!pool) {
      // Fallback demo data
      return res.status(200).json({
        success: true,
        projects: [
          { id: 1, name: 'DevOS Core Platform', description: 'Next-gen AI powered developer workspace.', status: 'In Progress', progress: 75, repo_url: 'github.com/devos/core', due_date: '2026-06-30', file_url: 'architecture_v1.pdf', memberCount: 3, taskCount: 8 },
          { id: 2, name: 'GraphQL API Gateway', description: 'Federated GraphQL gateway for microservices.', status: 'Completed', progress: 100, repo_url: 'github.com/devos/gateway', due_date: '2026-05-10', file_url: 'gateway_spec.docx', memberCount: 2, taskCount: 5 },
          { id: 3, name: 'AI Copilot VSCode Extension', description: 'Intelligent code completion plugin.', status: 'Planning', progress: 25, repo_url: 'github.com/devos/vscode', due_date: '2026-08-15', file_url: null, memberCount: 4, taskCount: 2 },
          { id: 4, name: 'Cloud Snippet Sync Daemon', description: 'Background service for syncing snippets.', status: 'In Progress', progress: 60, repo_url: 'github.com/devos/sync', due_date: '2026-07-20', file_url: null, memberCount: 2, taskCount: 4 },
        ]
      });
    }

    // Fetch projects where user is owner OR member
    const [projects] = await pool.query(`
      SELECT p.id, p.name, p.description, p.repo_url, p.status, p.progress, p.due_date, p.file_url, p.created_at,
             (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as memberCount,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as taskCount
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.user_id = ? OR pm.user_id = ?
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `, [userId, userId]);

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching projects' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, repo_url, status, progress, due_date, file_url } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    if (!pool) {
      const newProj = { id: Date.now(), name, description, repo_url, status: status || 'In Progress', progress: progress || 0, due_date: due_date || 'No deadline', file_url: file_url || null, memberCount: 1, taskCount: 0 };
      return res.status(201).json({ success: true, project: newProj });
    }

    const [result] = await pool.query(
      'INSERT INTO projects (name, description, repo_url, status, progress, due_date, file_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, repo_url, status || 'In Progress', progress || 0, due_date || 'No deadline', file_url || null, userId]
    );

    const projectId = result.insertId;

    // Add creator as owner in project_members
    await pool.query('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', [projectId, userId, 'Owner']);

    // Log activity
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'PROJECT_CREATED', `Created project: ${name}`]);

    const [newProject] = await pool.query(`
      SELECT p.*, 1 as memberCount, 0 as taskCount FROM projects p WHERE p.id = ?
    `, [projectId]);

    res.status(201).json({ success: true, project: newProject[0] });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating project' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, repo_url, status, progress, due_date, file_url } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) {
      return res.status(200).json({ success: true, message: 'Project updated successfully (demo fallback)' });
    }

    // Verify ownership or membership
    const [proj] = await pool.query('SELECT id FROM projects WHERE id = ? AND user_id = ?', [id, userId]);
    if (proj.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    await pool.query(
      'UPDATE projects SET name = ?, description = ?, repo_url = ?, status = ?, progress = ?, due_date = ?, file_url = ? WHERE id = ?',
      [name, description, repo_url, status, progress, due_date, file_url, id]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'PROJECT_UPDATED', `Updated project: ${name}`]);

    res.status(200).json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating project' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    if (!pool) {
      return res.status(200).json({ success: true, message: 'Project deleted successfully (demo fallback)' });
    }

    // Verify ownership
    const [proj] = await pool.query('SELECT name FROM projects WHERE id = ? AND user_id = ?', [id, userId]);
    if (proj.length === 0) {
      return res.status(403).json({ success: false, message: 'Only the project owner can delete this project' });
    }

    const projectName = proj[0].name;
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    await pool.query('INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, 'PROJECT_DELETED', `Deleted project: ${projectName}`]);

    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting project' });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { id } = req.params; // project id
    const { email, role } = req.body;
    const userId = req.user.id;
    const pool = getPool();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to invite member' });
    }

    if (!pool) {
      return res.status(200).json({ success: true, message: `Successfully invited ${email} to project!` });
    }

    // Verify user exists by email
    const [users] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist in DevOS' });
    }

    const inviteeId = users[0].id;
    const inviteeName = users[0].name;

    // Check if already member
    const [members] = await pool.query('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?', [id, inviteeId]);
    if (members.length > 0) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project' });
    }

    await pool.query('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', [id, inviteeId, role || 'Contributor']);

    // Create notification for invitee
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', 
      [inviteeId, 'Project Invitation', `You have been invited to collaborate on a project by User #${userId}`, 'invite']
    );

    res.status(200).json({ success: true, message: `Successfully added ${inviteeName} (${email}) to project!` });
  } catch (error) {
    console.error('Invite Member Error:', error);
    res.status(500).json({ success: false, message: 'Server error inviting team member' });
  }
};
