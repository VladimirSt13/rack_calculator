import { Router } from 'express';
import { register, login, logout, refresh, verifyEmail, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Реєстрація нового користувача
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * @desc Вхід користувача
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/auth/logout
 * @desc Вихід користувача
 * @access Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route POST /api/auth/refresh
 * @desc Оновлення access токена
 * @access Public (requires refresh token)
 */
router.post('/refresh', refresh);

/**
 * @route POST /api/auth/verify-email
 * @desc Підтвердження email
 * @access Public
 */
router.post('/verify-email', verifyEmail);

/**
 * @route GET /api/auth/me
 * @desc Отримати поточного користувача
 * @access Private
 */
router.get('/me', authenticate, me);

export default router;
