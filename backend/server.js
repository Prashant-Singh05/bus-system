import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/authRoutes.js';
import busRoutes from './routes/busRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import notificationsApiRoutes from './routes/notificationsApiRoutes.js';
import { pool } from './config/db.js';

// Load .env from backend root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { 
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in development
      }
    },
    credentials: true 
  }
});

// Allow all localhost ports for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow any localhost port for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    // Allow specific origins from env
    const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(null, true); // Allow all in development
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/bus', busRoutes);
app.use('/booking', bookingRoutes);
app.use('/admin', adminRoutes(io));
app.use('/routes', routeRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/notifications', notificationsApiRoutes);

io.on('connection', (socket) => {
  socket.emit('connected', { message: 'Socket connected' });
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. MySQL server is running');
    console.error('2. Database "bus_system" exists (run database.sql)');
    console.error('3. .env file has correct DB credentials');
    return false;
  }
}

const PORT = process.env.PORT || 4000;

async function startServer() {
  // Test database connection first
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.error('\n⚠️  Server starting anyway, but database operations may fail.');
    console.error('   Fix database connection to avoid errors.\n');
  }

  // Set up error handler
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n✗ Port ${PORT} is already in use!`);
      console.error('The kill-port script should have freed it, but a process might still be holding it.');
      console.error('\nPlease run: npm run kill:port4000');
      console.error('Or manually: netstat -ano | findstr :4000');
      console.error('Then: taskkill /PID <process_id> /F\n');
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`✓ Backend running on port ${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
  });
}

startServer();
