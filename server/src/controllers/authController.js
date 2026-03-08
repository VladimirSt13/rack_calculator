import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';
import { getDb } from '../db/index.js';
import { ROLE_PERMISSIONS, USER_ROLES } from '../helpers/roles.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../helpers/email.js';

const ALLOWED_DOMAIN = '@accu-energo.com.ua';

/**
 * Генерація access token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role,
      permissions: user.permissions ? JSON.parse(user.permissions) : ROLE_PERMISSIONS[user.role]
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Генерація refresh token
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Хешування refresh token
 */
export const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Збереження refresh token в БД
 */
export const saveRefreshToken = async (userId, refreshToken) => {
  const db = await getDb();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 днів
  
  db.prepare(`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `).run(userId, tokenHash, expiresAt.toISOString());
};

/**
 * Видалення refresh token з БД
 */
export const revokeRefreshToken = async (refreshToken) => {
  const db = await getDb();
  const tokenHash = hashRefreshToken(refreshToken);
  
  db.prepare(`
    UPDATE refresh_tokens 
    SET revoked = 1 
    WHERE token_hash = ?
  `).run(tokenHash);
};

/**
 * Перевірка refresh token
 */
export const verifyRefreshToken = async (refreshToken) => {
  const db = await getDb();
  const tokenHash = hashRefreshToken(refreshToken);
  
  const token = db.prepare(`
    SELECT rt.*, u.email, u.role, u.permissions
    FROM refresh_tokens rt
    JOIN users u ON rt.user_id = u.id
    WHERE rt.token_hash = ? 
      AND rt.revoked = 0 
      AND rt.expires_at > datetime('now')
  `).get(tokenHash);
  
  if (!token) {
    return null;
  }
  
  return {
    userId: token.user_id,
    email: token.email,
    role: token.role,
    permissions: token.permissions ? JSON.parse(token.permissions) : null
  };
};

/**
 * Очищення старих refresh tokenів
 */
export const cleanupExpiredTokens = async () => {
  const db = await getDb();
  db.prepare(`
    DELETE FROM refresh_tokens 
    WHERE expires_at < datetime('now') OR revoked = 1
  `).run();
};

/**
 * POST /api/auth/register
 * Реєстрація нового користувача
 */
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters',
        code: 'WEAK_PASSWORD'
      });
    }

    // Перевірка домену
    if (!email.endsWith(ALLOWED_DOMAIN)) {
      return res.status(403).json({ 
        error: `Registration is only allowed with ${ALLOWED_DOMAIN} email`,
        code: 'INVALID_DOMAIN'
      });
    }

    const db = await getDb();

    // Перевірка чи користувач вже існує
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ 
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Визначення ролі (перший користувач - адмін, інші - user)
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const role = userCount.count === 0 ? USER_ROLES.ADMIN : USER_ROLES.USER;

    // Хешування пароля
    const passwordHash = await bcrypt.hash(password, 12);

    // Генерація токену підтвердження email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 години

    // Створення користувача
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, role, email_verified, verification_token)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, passwordHash, role, 0, verificationToken);

    const userId = result.lastInsertRowid;

    // Створення токенів
    const user = { id: userId, email, role };
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    
    await saveRefreshToken(userId, refreshToken);

    // Збереження токену підтвердження в БД
    db.prepare(`
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(userId, verificationToken, verificationExpires.toISOString());

    // Відправка email з підтвердженням
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('[Auth] Failed to send verification email:', emailError.message);
      // Не блокуємо реєстрацію через помилку email
    }

    // Audit log
    await logAudit({
      userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.USER,
      entityId: userId,
      newValue: { email, role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: { id: userId, email, role },
      accessToken,
      refreshToken,
      emailVerified: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Вхід користувача
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    const db = await getDb();

    // Знайти користувача
    const user = db.prepare(`
      SELECT id, email, password_hash, role, permissions, email_verified
      FROM users 
      WHERE email = ?
    `).get(email);

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Перевірка пароля
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Перевірка підтвердження email
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Генерація токенів
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    
    await saveRefreshToken(user.id, refreshToken);

    // Audit log
    await logAudit({
      userId: user.id,
      action: AUDIT_ACTIONS.LOGIN,
      entityType: ENTITY_TYPES.USER,
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Login successful',
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        permissions: user.permissions ? JSON.parse(user.permissions) : ROLE_PERMISSIONS[user.role]
      },
      accessToken,
      refreshToken,
      emailVerified: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Вихід (відкликання refresh token)
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required',
        code: 'VALIDATION_ERROR'
      });
    }

    await revokeRefreshToken(refreshToken);

    // Audit log (якщо є user)
    if (req.user) {
      await logAudit({
        userId: req.user.userId,
        action: AUDIT_ACTIONS.LOGOUT,
        entityType: ENTITY_TYPES.USER,
        entityId: req.user.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Оновлення access token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required',
        code: 'VALIDATION_ERROR'
      });
    }

    const userData = await verifyRefreshToken(refreshToken);

    if (!userData) {
      return res.status(401).json({ 
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Генерація нового access token
    const newAccessToken = generateAccessToken(userData);

    // Відкликання старого refresh token і створення нового (rotation)
    await revokeRefreshToken(refreshToken);
    const newRefreshToken = generateRefreshToken();
    await saveRefreshToken(userData.userId, newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-email
 * Підтвердження email
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Verification token is required',
        code: 'VALIDATION_ERROR'
      });
    }

    const db = await getDb();

    // Перевірка токену
    const verification = db.prepare(`
      SELECT user_id, expires_at, verified
      FROM email_verifications
      WHERE token = ?
    `).get(token);

    if (!verification) {
      return res.status(404).json({ 
        error: 'Invalid verification token',
        code: 'INVALID_TOKEN'
      });
    }

    if (verification.verified) {
      return res.status(400).json({ 
        error: 'Email already verified',
        code: 'ALREADY_VERIFIED'
      });
    }

    const expiresAt = new Date(verification.expires_at);
    if (expiresAt < new Date()) {
      return res.status(400).json({ 
        error: 'Verification token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Оновлення користувача
    db.prepare(`
      UPDATE users 
      SET email_verified = 1, verification_token = NULL
      WHERE id = ?
    `).run(verification.user_id);

    // Позначення токену як використаний
    db.prepare(`
      UPDATE email_verifications
      SET verified = 1
      WHERE token = ?
    `).run(token);

    // Audit log
    await logAudit({
      userId: verification.user_id,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.USER,
      entityId: verification.user_id,
      newValue: { email_verified: true }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-verification
 * Повторна відправка листа з підтвердженням
 */
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required',
        code: 'VALIDATION_ERROR'
      });
    }

    const db = await getDb();

    const user = db.prepare('SELECT id, email_verified FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.email_verified) {
      return res.status(400).json({ 
        error: 'Email already verified',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Генерація нового токену
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + (24 * 60 * 60 * 1000));

    // Збереження токену
    db.prepare(`
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, verificationToken, verificationExpires.toISOString());

    // Оновлення користувача
    db.prepare(`
      UPDATE users SET verification_token = ? WHERE id = ?
    `).run(verificationToken, user.id);

    // Відправка email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('[Auth] Failed to send verification email:', emailError.message);
      return res.status(500).json({ 
        error: 'Failed to send verification email',
        code: 'EMAIL_SEND_ERROR'
      });
    }

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Отримати поточного користувача
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const db = await getDb();
    
    const user = db.prepare(`
      SELECT id, email, role, permissions, email_verified, created_at
      FROM users 
      WHERE id = ?
    `).get(req.user.userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ 
      user: { 
        ...user,
        permissions: user.permissions ? JSON.parse(user.permissions) : ROLE_PERMISSIONS[user.role]
      } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/admin/create-user
 * Створення користувача адміном (будь-яка пошта)
 */
export const adminCreateUser = async (req, res, next) => {
  try {
    const { email, password, role, permissions } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters',
        code: 'WEAK_PASSWORD'
      });
    }

    // Перевірка ролі
    const validRoles = [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        code: 'INVALID_ROLE'
      });
    }

    const db = await getDb();

    // Перевірка чи користувач вже існує
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ 
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Хешування пароля
    const passwordHash = await bcrypt.hash(password, 12);

    // Створення користувача
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, role, permissions, email_verified)
      VALUES (?, ?, ?, ?, 1)
    `).run(email, passwordHash, role || USER_ROLES.USER, permissions ? JSON.stringify(permissions) : null);

    const userId = result.lastInsertRowid;

    // Audit log
    await logAudit({
      userId: req.user.userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.USER,
      entityId: userId,
      newValue: { email, role, permissions },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: userId, email, role: role || USER_ROLES.OTHER, permissions }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * Запит на скидання пароля
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Валідація email
    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Перевірка формату email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();

    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(normalizedEmail);

    // Не показуємо чи існує користувач (безпека)
    if (!user) {
      return res.json({
        message: 'If the email exists, a password reset link has been sent',
        code: 'EMAIL_SENT'
      });
    }

    // Видалення тільки прострочених токенів
    db.prepare(`
      DELETE FROM password_resets 
      WHERE expires_at < datetime('now')
    `).run();

    // Перевірка чи є активний токен - видаляємо тільки його
    const existingToken = db.prepare(`
      SELECT id FROM password_resets 
      WHERE user_id = ? AND expires_at > datetime('now')
    `).get(user.id);

    if (existingToken) {
      db.prepare(`DELETE FROM password_resets WHERE id = ?`).run(existingToken.id);
    }

    // Генерація токену скидання пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + (60 * 60 * 1000)); // 1 година

    // Збереження хешу токену в БД (в транзакції)
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    db.prepare(`
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, resetTokenHash, resetExpires.toISOString());

    // Audit log (async, не блокує відповідь)
    logAudit({
      userId: user.id,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.USER,
      entityId: user.id,
      newValue: { password_reset_requested: true },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => {
      console.error('[Auth] Audit log error:', err);
    });

    // Відправка email (async, не блокуємо відповідь)
    sendPasswordResetEmail(normalizedEmail, resetToken).catch(emailError => {
      console.error('[Auth] Password reset email failed:', {
        email: normalizedEmail,
        userId: user.id,
        error: emailError.message,
        stack: emailError.stack,
        timestamp: new Date().toISOString()
      });
    });

    res.json({
      message: 'If the email exists, a password reset link has been sent',
      code: 'EMAIL_SENT'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Скидання пароля з токеном
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Валідація складності пароля (уніфіковано з клієнтом)
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
        code: 'WEAK_PASSWORD'
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return res.status(400).json({
        error: 'Password must contain uppercase, lowercase and number',
        code: 'WEAK_PASSWORD'
      });
    }

    const db = await getDb();

    // Перевірка токену
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const reset = db.prepare(`
      SELECT user_id, expires_at
      FROM password_resets
      WHERE token_hash = ?
    `).get(tokenHash);

    if (!reset) {
      return res.status(400).json({
        error: 'Invalid reset token',
        code: 'INVALID_TOKEN'
      });
    }

    const expiresAt = new Date(reset.expires_at);
    if (expiresAt < new Date()) {
      // Видалення простроченого токену
      db.prepare(`DELETE FROM password_resets WHERE token_hash = ?`).run(tokenHash);
      
      return res.status(400).json({
        error: 'Reset token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Хешування нового пароля
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Оновлення пароля (в транзакції)
    db.transaction(() => {
      // Оновлення пароля
      db.prepare(`
        UPDATE users SET password_hash = ? WHERE id = ?
      `).run(passwordHash, reset.user_id);

      // Видалення використаних токенів
      db.prepare(`
        DELETE FROM password_resets WHERE user_id = ?
      `).run(reset.user_id);

      // Відкликання всіх refresh tokenів користувача
      db.prepare(`
        UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?
      `).run(reset.user_id);
    })();

    // Audit log (async, не блокує)
    logAudit({
      userId: reset.user_id,
      action: AUDIT_ACTIONS.PASSWORD_CHANGE,
      entityType: ENTITY_TYPES.USER,
      entityId: reset.user_id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => {
      console.error('[Auth] Audit log error:', err);
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/change-password
 * Зміна пароля (для авторизованого користувача)
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Валідація складності пароля (уніфіковано з resetPassword)
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
        code: 'WEAK_PASSWORD'
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return res.status(400).json({
        error: 'Password must contain uppercase, lowercase and number',
        code: 'WEAK_PASSWORD'
      });
    }

    const db = await getDb();

    // Отримання користувача
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Перевірка поточного пароля
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Хешування нового пароля
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Оновлення пароля (в транзакції)
    db.transaction(() => {
      db.prepare(`
        UPDATE users SET password_hash = ? WHERE id = ?
      `).run(passwordHash, userId);

      // Відкликання всіх refresh tokenів крім поточного
      db.prepare(`
        UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?
      `).run(userId);
    })();

    // Audit log (async)
    logAudit({
      userId,
      action: AUDIT_ACTIONS.PASSWORD_CHANGE,
      entityType: ENTITY_TYPES.USER,
      entityId: userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => {
      console.error('[Auth] Audit log error:', err);
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  adminCreateUser,
  forgotPassword,
  resetPassword,
  changePassword,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
};
