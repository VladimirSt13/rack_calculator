import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import validator from "validator";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { EmailVerification } from "../models/EmailVerification.js";
import { PasswordReset } from "../models/PasswordReset.js";
import { AuditLog } from "../models/AuditLog.js";
import { ROLE_PERMISSIONS, USER_ROLES } from "../helpers/roles.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../helpers/email.js";

const ALLOWED_DOMAIN = "@accu-energo.com.ua";

/**
 * Генерація access token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || ROLE_PERMISSIONS[user.role],
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
  );
};

/**
 * Генерація refresh token
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
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
        error: "Email and password are required",
        code: "VALIDATION_ERROR",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
        code: "WEAK_PASSWORD",
      });
    }

    // Перевірка домену
    if (!email.endsWith(ALLOWED_DOMAIN)) {
      return res.status(403).json({
        error: `Registration is only allowed with ${ALLOWED_DOMAIN} email`,
        code: "INVALID_DOMAIN",
      });
    }

    // Перевірка чи користувач вже існує
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: "User already exists",
        code: "USER_EXISTS",
      });
    }

    // Визначення ролі (перший користувач - адмін, інші - user)
    const db = await User.getDb();
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    const role = userCount.count === 0 ? USER_ROLES.ADMIN : USER_ROLES.USER;

    // Хешування пароля
    const passwordHash = await bcrypt.hash(password, 12);

    // Генерація токену підтвердження email
    const { verification, token: verificationToken } =
      await EmailVerification.createWithToken(0);

    // Створення користувача
    const user = await User.create({
      email,
      passwordHash,
      role,
      emailVerified: false,
      verificationToken,
    });

    // Створення токенів
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Оновлення verification з правильним userId
    await EmailVerification.create({
      userId: user.id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Відправка email з підтвердженням
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error(
        "[Auth] Failed to send verification email:",
        emailError.message,
      );
    }

    // Audit log
    await AuditLog.create({
      userId: user.id,
      action: "create",
      entityType: "user",
      entityId: user.id,
      newValue: { email, role },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
      emailVerified: false,
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
        error: "Email and password are required",
        code: "VALIDATION_ERROR",
      });
    }

    // Знайти користувача
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Перевірка пароля
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Перевірка підтвердження email
    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // Генерація токенів
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Audit log
    await AuditLog.create({
      userId: user.id,
      action: "login",
      entityType: "user",
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      message: "Login successful",
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
      emailVerified: true,
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
        error: "Refresh token is required",
        code: "VALIDATION_ERROR",
      });
    }

    const tokenHash = RefreshToken.hashToken(refreshToken);
    const token = await RefreshToken.findByTokenHash(tokenHash);

    if (token) {
      await token.revoke();
    }

    // Audit log
    if (req.user) {
      await AuditLog.create({
        userId: req.user.userId,
        action: "logout",
        entityType: "user",
        entityId: req.user.userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
    }

    res.json({ message: "Logged out successfully" });
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
        error: "Refresh token is required",
        code: "VALIDATION_ERROR",
      });
    }

    const tokenHash = RefreshToken.hashToken(refreshToken);
    const token = await RefreshToken.findByTokenHash(tokenHash);

    if (!token || !token.isValid()) {
      return res.status(401).json({
        error: "Invalid or expired refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    const user = await User.findById(token.userId);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Генерація нового access token
    const newAccessToken = generateAccessToken(user);

    // Rotation: відкликання старого та створення нового
    await token.revoke();
    const newRefreshToken = generateRefreshToken();
    await RefreshToken.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
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
        error: "Verification token is required",
        code: "VALIDATION_ERROR",
      });
    }

    const verification = await EmailVerification.findByToken(token);

    if (!verification) {
      return res.status(404).json({
        error: "Invalid verification token",
        code: "INVALID_TOKEN",
      });
    }

    if (verification.verified) {
      return res.status(400).json({
        error: "Email already verified",
        code: "ALREADY_VERIFIED",
      });
    }

    if (!verification.isValid()) {
      return res.status(400).json({
        error: "Verification token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    // Оновлення користувача
    const user = await User.findById(verification.userId);
    if (user) {
      await user.update({ emailVerified: true, verificationToken: null });
    }

    // Позначення токену як використаний
    await verification.markAsVerified();

    // Audit log
    await AuditLog.create({
      userId: verification.userId,
      action: "update",
      entityType: "user",
      entityId: verification.userId,
      newValue: { email_verified: true },
    });

    res.json({ message: "Email verified successfully" });
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
        error: "Email is required",
        code: "VALIDATION_ERROR",
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        error: "Email already verified",
        code: "ALREADY_VERIFIED",
      });
    }

    // Генерація нового токену
    const { token: verificationToken } =
      await EmailVerification.createWithToken(
        user.id,
        24, // години
      );

    // Відправка email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error(
        "[Auth] Failed to send verification email:",
        emailError.message,
      );
      return res.status(500).json({
        error: "Failed to send verification email",
        code: "EMAIL_SEND_ERROR",
      });
    }

    res.json({ message: "Verification email sent successfully" });
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
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/admin/create-user
 * Створення користувача адміном
 */
export const adminCreateUser = async (req, res, next) => {
  try {
    const { email, password, role, permissions } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        code: "VALIDATION_ERROR",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
        code: "WEAK_PASSWORD",
      });
    }

    // Перевірка ролі
    const validRoles = [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
        code: "INVALID_ROLE",
      });
    }

    // Перевірка чи користувач вже існує
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: "User already exists",
        code: "USER_EXISTS",
      });
    }

    // Хешування пароля
    const passwordHash = await bcrypt.hash(password, 12);

    // Створення користувача
    const user = await User.create({
      email,
      passwordHash,
      role: role || USER_ROLES.USER,
      permissions,
      emailVerified: true,
    });

    // Audit log
    await AuditLog.create({
      userId: req.user.userId,
      action: "create",
      entityType: "user",
      entityId: user.id,
      newValue: { email, role, permissions },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      message: "User created successfully",
      user: user.toSafeObject(),
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

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        code: "VALIDATION_ERROR",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findByEmail(normalizedEmail);

    // Не показуємо чи існує користувач (безпека)
    if (!user) {
      return res.json({
        message: "If the email exists, a password reset link has been sent",
        code: "EMAIL_SENT",
      });
    }

    // Очищення старих токенів
    await PasswordReset.cleanupExpired();

    // Генерація токену скидання пароля
    const { passwordReset, token: resetToken } =
      await PasswordReset.createWithToken(
        user.id,
        1, // година
      );

    // Audit log
    AuditLog.create({
      userId: user.id,
      action: "update",
      entityType: "user",
      entityId: user.id,
      newValue: { password_reset_requested: true },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    }).catch((err) => console.error("[Auth] Audit log error:", err));

    // Відправка email
    sendPasswordResetEmail(normalizedEmail, resetToken).catch((emailError) => {
      console.error("[Auth] Password reset email failed:", emailError.message);
    });

    res.json({
      message: "If the email exists, a password reset link has been sent",
      code: "EMAIL_SENT",
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
        error: "Token and new password are required",
        code: "VALIDATION_ERROR",
      });
    }

    // Валідація складності пароля
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
        code: "WEAK_PASSWORD",
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return res.status(400).json({
        error: "Password must contain uppercase, lowercase and number",
        code: "WEAK_PASSWORD",
      });
    }

    const tokenHash = PasswordReset.hashToken(token);
    const passwordReset = await PasswordReset.findByTokenHash(tokenHash);

    if (!passwordReset || !passwordReset.isValid()) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
        code: "INVALID_TOKEN",
      });
    }

    // Хешування нового пароля
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Оновлення пароля
    const user = await User.findById(passwordReset.userId);
    if (user) {
      await user.update({ passwordHash });
    }

    // Видалення токену
    await passwordReset.delete();

    // Відкликання всіх refresh tokenів
    await RefreshToken.revokeAllForUser(passwordReset.userId);

    // Audit log
    AuditLog.create({
      userId: passwordReset.userId,
      action: "password_change",
      entityType: "user",
      entityId: passwordReset.userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    }).catch((err) => console.error("[Auth] Audit log error:", err));

    res.json({ message: "Password reset successfully" });
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
        error: "Current password and new password are required",
        code: "VALIDATION_ERROR",
      });
    }

    // Валідація складності пароля
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
        code: "WEAK_PASSWORD",
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return res.status(400).json({
        error: "Password must contain uppercase, lowercase and number",
        code: "WEAK_PASSWORD",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Перевірка поточного пароля
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({
        error: "Current password is incorrect",
        code: "INVALID_PASSWORD",
      });
    }

    // Хешування нового пароля
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await user.update({ passwordHash });

    // Відкликання всіх refresh tokenів
    await RefreshToken.revokeAllForUser(userId);

    // Audit log
    AuditLog.create({
      userId,
      action: "password_change",
      entityType: "user",
      entityId: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    }).catch((err) => console.error("[Auth] Audit log error:", err));

    res.json({ message: "Password changed successfully" });
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
};
