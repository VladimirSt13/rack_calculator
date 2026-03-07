import { Router } from 'express';
import * as usersController from '../controllers/usersController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = Router();

// Всі routes вимагають авторизації та ролі admin
router.use(authenticate);
router.use(authorizeRole('admin'));

/**
 * GET /api/users
 * Отримати список користувачів
 */
router.get('/', usersController.getUsers);

/**
 * GET /api/users/:id
 * Отримати користувача
 */
router.get('/:id', usersController.getUser);

/**
 * GET /api/users/:id/audit
 * Отримати історію аудиту користувача
 */
router.get('/:id/audit', usersController.getUserAudit);

/**
 * POST /api/users
 * Створити користувача
 */
router.post('/', usersController.createUser);

/**
 * PUT /api/users/:id
 * Оновити користувача
 */
router.put('/:id', usersController.updateUser);

/**
 * DELETE /api/users/:id
 * Видалити користувача
 */
router.delete('/:id', usersController.deleteUser);

export default router;
