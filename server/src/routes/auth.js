import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * Реєстрація нового користувача
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDb();
    
    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, passwordHash);

    // Generate token
    const token = jwt.sign(
      { userId: result.lastInsertRowid, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      user: { id: result.lastInsertRowid, email },
      token,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Вхід користувача
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    
    // Find user
    const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Вихід (очищення токену на клієнті)
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Отримати поточного користувача
 */
router.get('/me', authenticate, (req, res, next) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
