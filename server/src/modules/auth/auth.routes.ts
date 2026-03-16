import { Router } from 'express';
import { User } from '../../database/models/user.model';
import { RefreshToken } from '../../database/models/refresh-token.model';
import { EmailVerification } from '../../database/models/email-verification.model';
import { PasswordReset } from '../../database/models/password-reset.model';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtService } from '../../common/utils/jwt.service';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate } from '../../common/middleware/auth.middleware';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto';

/**
 * Auth Routes
 * Маршрути для авторизації
 */
export const authRoutes = Router();

// Ініціалізація залежностей
const authRepository = new AuthRepository(
  User,
  RefreshToken,
  EmailVerification,
  PasswordReset,
);
const jwtService = new JwtService();
const authService = new AuthService(authRepository, jwtService);
const authController = new AuthController(authService);

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route POST /api/auth/login
 * @description Login user
 * @access Public
 */
authRoutes.post(
  '/login',
  validateRequest(LoginDto),
  authController.login,
);

/**
 * @route POST /api/auth/register
 * @description Register new user
 * @access Public
 */
authRoutes.post(
  '/register',
  validateRequest(RegisterDto),
  authController.register,
);

/**
 * @route POST /api/auth/refresh
 * @description Refresh access token
 * @access Public
 */
authRoutes.post(
  '/refresh',
  validateRequest(RefreshTokenDto),
  authController.refreshToken,
);

/**
 * @route POST /api/auth/forgot-password
 * @description Request password reset
 * @access Public
 */
authRoutes.post(
  '/forgot-password',
  validateRequest(ForgotPasswordDto),
  authController.forgotPassword,
);

/**
 * @route POST /api/auth/reset-password
 * @description Reset password
 * @access Public
 */
authRoutes.post(
  '/reset-password',
  validateRequest(ResetPasswordDto),
  authController.resetPassword,
);

/**
 * @route POST /api/auth/verify-email
 * @description Verify email address
 * @access Public
 */
authRoutes.post(
  '/verify-email',
  validateRequest(VerifyEmailDto),
  authController.verifyEmail,
);

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * @route POST /api/auth/logout
 * @description Logout user
 * @access Private
 */
authRoutes.post('/logout', authenticate, authController.logout);

/**
 * @route POST /api/auth/logout-all
 * @description Logout from all devices
 * @access Private
 */
authRoutes.post('/logout-all', authenticate, authController.logoutAll);

export default authRoutes;
