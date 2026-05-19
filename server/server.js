import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB, getPool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import snippetRoutes from './routes/snippetRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

dotenv.config();

// ── Environment Validation ─────────────────────────────────────────────────
// Crash early if critical secrets are missing — never run with defaults
const REQUIRED_ENV = ['JWT_SECRET', 'GEMINI_API_KEY'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`\n🔴 FATAL: Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('   Copy server/.env.example to server/.env and fill in all values.\n');
  process.exit(1);
}

const IS_PROD = process.env.NODE_ENV === 'production';
const PORT    = process.env.PORT || 5000;

// ── Allowed Origins (restrict in production) ───────────────────────────────
const ALLOWED_ORIGINS = IS_PROD
  ? (process.env.CLIENT_URL || 'http://localhost:5173').split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

// ── Security & Performance Middleware ──────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded files
  contentSecurityPolicy: IS_PROD ? undefined : false,     // Relax CSP in dev
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));  // Reduced from 15mb — tighten payload limit
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use('/uploads', express.static('uploads'));

// ── Rate Limiters ──────────────────────────────────────────────────────────
// General API limiter: 200 requests / 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' }
});

// Strict AI limiter: 30 AI requests / 15 minutes (prevents API key abuse)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI request limit reached. Try again in 15 minutes.' }
});

// Auth limiter: 20 login attempts / 15 minutes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again later.' }
});

app.use('/api', generalLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static assets from the React client build in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (IS_PROD) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res, next) => {
    // If it's an API route that reached here, let it go to the 404/error handler
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  // Never leak stack traces or internal details in production
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${status}:`, err.message);
  res.status(status).json({
    success: false,
    message: IS_PROD ? 'An internal server error occurred' : (err.message || 'Internal Server Error'),
    ...(IS_PROD ? {} : { stack: err.stack })
  });
});







// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'DevOS Backend API is online', timestamp: new Date() });
});

// Real-time Socket.IO Handling
let onlineUsers = new Map(); // socketId -> { userId, name, avatar }

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on('user_connected', (userData) => {
    if (userData && userData.id) {
      onlineUsers.set(socket.id, userData);
      io.emit('online_users', Array.from(onlineUsers.values()));
    }
  });

  socket.on('join_team', (teamId) => {
    socket.join(`team_${teamId}`);
    console.log(`Socket ${socket.id} joined room team_${teamId}`);
  });

  socket.on('send_message', async (messageData) => {
    const { sender_id, team_id, content, sender_name, sender_avatar } = messageData;
    
    // Broadcast immediately to room
    const fullMsg = {
      id: Date.now(),
      sender_id,
      team_id,
      content,
      sender_name: sender_name || 'Alex Mercer',
      sender_avatar: sender_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: 'Just now'
    };

    io.to(`team_${team_id}`).emit('receive_message', fullMsg);

    // Persist to MySQL
    const pool = getPool();
    if (pool) {
      try {
        await pool.query('INSERT INTO messages (sender_id, team_id, content) VALUES (?, ?, ?)', [
          sender_id, team_id, content
        ]);
      } catch (err) {
        console.error('Socket DB Insert Error:', err.message);
      }
    }
  });

  socket.on('typing', ({ teamId, userName, isTyping }) => {
    socket.to(`team_${teamId}`).emit('user_typing', { userName, isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`⚡ Socket disconnected: ${socket.id}`);
    onlineUsers.delete(socket.id);
    io.emit('online_users', Array.from(onlineUsers.values()));
  });
});

// Initialize DB and start server
async function startServer() {
  const pool = await initDB();

  // If pool was created successfully, let's seed a demo user if table is empty
  if (pool) {
    try {
      const [users] = await pool.query('SELECT * FROM users');
      if (users.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('password123', salt);
        await pool.query(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          ['Alex Mercer', 'alex@devos.io', hashed, 'Senior Full-Stack Engineer']
        );
        console.log('✓ Seeded demo user: alex@devos.io / password123');
      }
    } catch (err) {
      console.error('Seeding error:', err.message);
    }
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 DevOS Backend & Socket.IO Server running on http://localhost:${PORT}`);
  });
}

startServer();
