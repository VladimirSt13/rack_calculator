import { Router } from 'express';
import { User } from '../../database/models/user.model';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorizeRole } from '../../common/middleware/auth.middleware';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
} from './dto';

/**
 * Users Routes
 * Маршрути для управління користувачами
 */
export const usersRoutes = Router();

// Ініціалізація залежностей
const usersRepository = new UsersRepository(User);
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

// ==========================================
// PUBLIC ROUTES
// ==========================================

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * @route GET /api/users/me
 * @description Get current user profile
 * @access Private
 */
usersRoutes.get('/me', authenticate, usersController.getMe);

/**
 * @route PATCH /api/users/me
 * @description Update current user profile
 * @access Private
 */
usersRoutes.patch('/me', authenticate, usersController.updateMe);

/**
 * @route GET /api/users
 * @description Get all users with pagination
 * @access Private (Admin/Manager)
 */
usersRoutes.get('/', authenticate, usersController.getUsers);

/**
 * @route GET /api/users/stats
 * @description Get users statistics
 * @access Private (Admin)
 */
usersRoutes.get('/stats', authenticate, usersController.getUsersStats);

/**
 * @route GET /api/users/:id
 * @description Get user by ID
 * @access Private
 */
usersRoutes.get('/:id', authenticate, usersController.getUserById);

/**
 * @route POST /api/users
 * @description Create new user
 * @access Private (Admin)
 */
usersRoutes.post(
  '/',
  authenticate,
  authorizeRole('admin'),
  validateRequest(CreateUserDto),
  usersController.createUser,
);

/**
 * @route PATCH /api/users/:id
 * @description Update user
 * @access Private (Admin or self)
 */
usersRoutes.patch(
  '/:id',
  authenticate,
  validateRequest(UpdateUserDto),
  usersController.updateUser,
);

/**
 * @route POST /api/users/:id/change-password
 * @description Change user password
 * @access Private
 */
usersRoutes.post(
  '/:id/change-password',
  authenticate,
  validateRequest(ChangePasswordDto),
  usersController.changePassword,
);

/**
 * @route DELETE /api/users/:id
 * @description Delete user (soft delete)
 * @access Private (Admin)
 */
usersRoutes.delete(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  usersController.deleteUser,
);

/**
 * @route POST /api/users/:id/restore
 * @description Restore deleted user
 * @access Private (Admin)
 */
usersRoutes.post(
  '/:id/restore',
  authenticate,
  authorizeRole('admin'),
  usersController.restoreUser,
);

export default usersRoutes;
