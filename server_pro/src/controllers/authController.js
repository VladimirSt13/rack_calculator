import { getDb } from '../db/index.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Реєстрація нового користувача
 * 
 * @body {string} email - Email користувача
 * @body {string} password - Пароль (мін. 6 символів)
 * @returns {object} User data + tokens
 */
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create user
    const user = await User.create({ email, password });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    getDb().prepare(`
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, verificationToken, expiresAt.toISOString());

    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = await RefreshToken.createToken(user.id);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: false,
      },
      token,
      verificationToken, // In production, send via email
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

/**
 * Вхід користувача
 * 
 * @body {string} email - Email
 * @body {string} password - Пароль
 * @returns {object} User data + tokens
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValid = await User.validatePassword(user, password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = await RefreshToken.createToken(user.id);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions || '[]'),
        emailVerified: user.email_verified === 1,
      },
      token,
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Вихід користувача
 */
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (refreshToken) {
      await RefreshToken.revokeToken(refreshToken);
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('[Logout Error]', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * Оновлення access токена
 */
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Validate refresh token
    const tokenData = await RefreshToken.validateToken(refreshToken);

    if (!tokenData) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const token = jwt.sign(
      { 
        userId: tokenData.userId, 
        email: tokenData.email,
        role: tokenData.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({ token });
  } catch (error) {
    console.error('[Refresh Error]', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

/**
 * Підтвердження email
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const record = getDb().prepare(`
      SELECT * FROM email_verifications 
      WHERE token = ? AND expires_at > datetime('now') AND verified = 0
    `).get(token);

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user
    User.update(record.user_id, { email_verified: 1, verification_token: null });

    // Mark verification as used
    getDb().prepare(`
      UPDATE email_verifications SET verified = 1 WHERE id = ?
    `).run(record.id);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('[Verify Email Error]', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

/**
 * Отримати поточного користувача
 */
export const me = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]'),
      emailVerified: user.email_verified === 1,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('[Me Error]', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

/**
 * Helper: Generate JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export default { register, login, logout, refresh, verifyEmail, me };
