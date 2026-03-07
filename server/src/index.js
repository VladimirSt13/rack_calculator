import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initDatabase } from './db/index.js';

// Routes
import authRoutes from './routes/auth.js';
import priceRoutes from './routes/price.js';
import priceComponentsRoutes from './routes/priceComponents.js';
import calculationsRoutes from './routes/calculations.js';
import rackRoutes from './routes/rack.js';
import batteryRoutes from './routes/battery.js';
import rolesRoutes from './routes/roles.js';
import usersRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====

// CORS - ПЕРШИМ! (до helmet)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
}));

// Security headers (виключаємо CORS заголовки)
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== DATABASE INITIALIZATION =====
initDatabase();

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/price', priceComponentsRoutes);
app.use('/api/calculations', calculationsRoutes);
app.use('/api/rack', rackRoutes);
app.use('/api/battery', batteryRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[CORS] Origins: localhost:3000, localhost:5173`);
  console.log(`[Env] ${process.env.NODE_ENV}`);
});

export default app;
