import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = Router();

/**
 * POST /api/auth/register
 * Реєстрація нового користувача
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Вхід користувача
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * Вихід (відкликання refresh token)
 */
router.post('/logout', authController.logout);

/**
 * POST /api/auth/refresh
 * Оновлення access token
 */
router.post('/refresh', authController.refreshToken);

/**
 * POST /api/auth/verify-email
 * Підтвердження email
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * POST /api/auth/resend-verification
 * Повторна відправка листа з підтвердженням
 */
router.post('/resend-verification', authController.resendVerification);

/**
 * POST /api/auth/forgot-password
 * Запит на скидання пароля
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Скидання пароля з токеном
 */
router.post('/reset-password', authController.resetPassword);

/**
 * POST /api/auth/change-password
 * Зміна пароля (для авторизованого користувача)
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * GET /api/auth/me
 * Отримати поточного користувача
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * POST /api/auth/admin/create-user
 * Створення користувача адміном (будь-яка пошта)
 */
router.post('/admin/create-user', authenticate, authorizeRole('admin'), authController.adminCreateUser);

export default router;
