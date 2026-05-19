import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

let pool;

export async function initDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'devos'}\`;`);
    await connection.end();

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'devos',
      waitForConnections: true,
      connectionLimit: 20, // Increased connection pool for production concurrency
      queueLimit: 0
    });

    console.log(`✓ MySQL Database connected and verified: ${process.env.DB_NAME || 'devos'}`);

    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT 'Senior Full-Stack Engineer',
        avatar VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        github_username VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        repo_url VARCHAR(500),
        status ENUM('Planning', 'In Progress', 'Completed') DEFAULT 'In Progress',
        progress INT DEFAULT 0,
        due_date VARCHAR(100) DEFAULT 'No deadline',
        file_url VARCHAR(500) DEFAULT NULL,
        user_id INT NOT NULL,
        team_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS project_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(100) DEFAULT 'Developer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_project_user (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        assigned_to INT DEFAULT NULL,
        status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        due_date VARCHAR(100),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS task_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS snippets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        language VARCHAR(100) NOT NULL,
        code_content TEXT NOT NULL,
        tags VARCHAR(255),
        is_favorite BOOLEAN DEFAULT FALSE,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS prompts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        prompt_text TEXT NOT NULL,
        tags VARCHAR(255),
        is_favorite BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT TRUE,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        tags VARCHAR(255),
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS note_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        version_number INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(100) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT DEFAULT NULL,
        team_id INT DEFAULT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(255) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        url VARCHAR(500) NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      // ==========================================
      // PRODUCTION DATABASE INDEXING OPTIMIZATIONS
      // ==========================================
      `CREATE INDEX idx_projects_user ON projects(user_id, status);`,
      `CREATE INDEX idx_tasks_user ON tasks(user_id, status, priority);`,
      `CREATE INDEX idx_activity_user ON activity_logs(user_id, action);`,
      `CREATE INDEX idx_snippets_user ON snippets(user_id, language);`,
      `CREATE INDEX idx_notes_user ON notes(user_id, category);`,
      `CREATE INDEX idx_files_user ON files(user_id);`
    ];

    for (const sql of tables) {
      try {
        await pool.query(sql);
      } catch (err) {
        // Ignore duplicate index errors if already exists
        if (!err.message.includes('Duplicate key name')) {
          console.error(`Table/Index creation warning: ${err.message}`);
        }
      }
    }

    console.log('✓ MySQL Complete Database Schema & Production Indexing verified successfully');

    await seedDatabase(pool);

    return pool;
  } catch (error) {
    console.error('✗ MySQL Database initialization failed.', error.message);
    pool = null;
    return null;
  }
}

async function seedDatabase(pool) {
  try {
    const [users] = await pool.query('SELECT id FROM users');
    if (users.length === 0) {
      console.log('Seeding initial mock data...');
      
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('password123', salt);
      const [userRes] = await pool.query(
        'INSERT INTO users (name, email, password, role, github_username) VALUES (?, ?, ?, ?, ?)',
        ['Alex Mercer', 'alex@devos.io', hashed, 'Senior Full-Stack Engineer', 'octocat']
      );
      const userId = userRes.insertId;

      const [userRes2] = await pool.query(
        'INSERT INTO users (name, email, password, role, github_username) VALUES (?, ?, ?, ?, ?)',
        ['Elena Rostova', 'elena@devos.io', hashed, 'Lead DevOps Engineer', 'torvalds']
      );
      const elenaId = userRes2.insertId;

      // Seed Teams
      const [teamRes] = await pool.query('INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)', [
        '#general-engineering', 'General engineering discussion and sprint announcements', userId
      ]);
      const teamId1 = teamRes.insertId;

      const [teamRes2] = await pool.query('INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)', [
        '#devops-infra', 'CI/CD pipelines, Kubernetes clusters, and AWS infrastructure', elenaId
      ]);
      const teamId2 = teamRes2.insertId;

      // Seed Messages
      await pool.query('INSERT INTO messages (sender_id, team_id, content) VALUES (?, ?, ?)', [
        userId, teamId1, 'Hey team! Welcome to the new DevOS real-time chat platform 🚀'
      ]);
      await pool.query('INSERT INTO messages (sender_id, team_id, content) VALUES (?, ?, ?)', [
        elenaId, teamId1, 'Awesome! I am setting up the AWS ECS deployment pipeline right now 💻✨'
      ]);
      await pool.query('INSERT INTO messages (sender_id, team_id, content) VALUES (?, ?, ?)', [
        userId, teamId1, 'Sounds perfect Elena. Let me know if you need any environment variables configured 👍'
      ]);

      // Seed Notifications
      const notifs = [
        [userId, 'Task Assigned', 'Elena assigned you to "Implement OAuth2 Flow with GitHub"', 'task', false],
        [userId, 'Deadline Reminder', 'Sprint 1 Deadline is tomorrow at 5:00 PM UTC ⏰', 'deadline', false],
        [userId, 'Team Mention', 'Elena mentioned you in #devops-infra: "@alex check the new Dockerfile config"', 'mention', false],
        [userId, 'Project Invitation', 'You have been invited to collaborate on "GraphQL API Gateway"', 'invite', true]
      ];
      for (const n of notifs) {
        await pool.query('INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)', n);
      }

      // Seed Files
      const files = [
        ['gateway-spec.pdf', 'gateway-spec.pdf', 'application/pdf', 4404019, '/uploads/gateway-spec.pdf', userId],
        ['system-architecture.png', 'system-architecture.png', 'image/png', 2150400, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80', userId],
        ['sprint-planning.docx', 'sprint-planning.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1048576, '/uploads/sprint-planning.docx', elenaId]
      ];
      for (const f of files) {
        await pool.query('INSERT INTO files (name, original_name, mime_type, size, url, user_id) VALUES (?, ?, ?, ?, ?, ?)', f);
      }

      console.log('✓ Initial mock data seeded successfully');
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
}

export function getPool() {
  return pool;
}
