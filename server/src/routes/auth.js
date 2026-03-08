import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = Router();

/**
 * @swagger
 * /auth/users:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Користувача успішно створено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Користувач з таким email вже існує
 *       403:
 *         description: Недоступний домен email
 */
router.post('/users', authController.register);

/**
 * @swagger
 * /auth/session:
 *   post:
 *     summary: Вхід користувача
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@accu-energo.com.ua
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: P@ssw0rd13
 *     responses:
 *       200:
 *         description: Успішний вхід
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Невірні облікові дані
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Email не підтверджено
 *       429:
 *         description: Забагато спроб (Rate Limit)
 */
router.post('/session', authController.login);

/**
 * @swagger
 * /auth/session:
 *   delete:
 *     summary: Вихід з системи
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: dGVzdC0...
 *     responses:
 *       200:
 *         description: Успішний вихід
 *       400:
 *         description: Refresh token обов'язковий
 */
router.delete('/session', authController.logout);

/**
 * @swagger
 * /auth/token:
 *   post:
 *     summary: Оновлення access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: dGVzdC0...
 *     responses:
 *       200:
 *         description: Token оновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Невірний refresh token
 *       403:
 *         description: Token відкликано або термін дії закінчився
 */
router.post('/token', authController.refreshToken);

/**
 * @swagger
 * /auth/email/verify:
 *   post:
 *     summary: Підтвердження email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123...
 *     responses:
 *       200:
 *         description: Email підтверджено
 *       400:
 *         description: Невірний або прострочений токен
 *       404:
 *         description: Користувача не знайдено
 */
router.post('/email/verify', authController.verifyEmail);

/**
 * @swagger
 * /auth/email/verification:
 *   post:
 *     summary: Повторна відправка листа з підтвердженням
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@accu-energo.com.ua
 *     responses:
 *       200:
 *         description: Лист відправлено
 *       404:
 *         description: Користувача не знайдено
 */
router.post('/email/verification', authController.resendVerification);

/**
 * @swagger
 * /auth/password-resets:
 *   post:
 *     summary: Запит на скидання пароля
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@accu-energo.com.ua
 *     responses:
 *       200:
 *         description: Лист зі скиданням пароля відправлено (якщо email існує)
 *       400:
 *         description: Email обов'язковий
 */
router.post('/password-resets', authController.forgotPassword);

/**
 * @swagger
 * /auth/password:
 *   put:
 *     summary: Скидання пароля з токеном
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123...
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: NewP@ssw0rd13
 *     responses:
 *       200:
 *         description: Пароль успішно змінено
 *       400:
 *         description: Невірний або прострочений токен
 *       422:
 *         description: Слабкий пароль
 */
router.put('/password', authController.resetPassword);

/**
 * @swagger
 * /auth/password:
 *   patch:
 *     summary: Зміна пароля (для авторизованого користувача)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldP@ssw0rd
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: NewP@ssw0rd13
 *     responses:
 *       200:
 *         description: Пароль успішно змінено
 *       401:
 *         description: Неавторизовано
 *       403:
 *         description: Невірний поточний пароль
 *       422:
 *         description: Слабкий пароль
 */
router.patch('/password', authenticate, authController.changePassword);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Отримати поточного користувача
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Інформація про користувача
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Неавторизовано
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @swagger
 * /auth/admin/users:
 *   post:
 *     summary: Створення користувача адміном
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Користувача створено
 *       401:
 *         description: Неавторизовано
 *       403:
 *         description: Недостатньо прав (потрібен admin)
 */
router.post('/admin/users', authenticate, authorizeRole('admin'), authController.adminCreateUser);

export default router;
