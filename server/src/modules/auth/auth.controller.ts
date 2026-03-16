import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  AuthResponseDto,
} from './dto';

/**
 * Auth Controller
 * Обробка HTTP запитів для авторизації
 */
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Логін користувача
   * POST /api/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const dto: LoginDto = req.body;
    const result: AuthResponseDto = await this.authService.login(dto);
    ApiResponder.success(res, result);
  });

  /**
   * Реєстрація користувача
   * POST /api/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const dto: RegisterDto = req.body;
    const result: AuthResponseDto = await this.authService.register(dto);
    ApiResponder.created(res, result);
  });

  /**
   * Оновлення токенів
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const dto: RefreshTokenDto = req.body;
    const result: AuthResponseDto = await this.authService.refreshToken(dto);
    ApiResponder.success(res, result);
  });

  /**
   * Вихід користувача
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await this.authService.logout(refreshToken);
    ApiResponder.success(res, { message: 'Logged out successfully' });
  });

  /**
   * Вихід з усіх пристроїв
   * POST /api/auth/logout-all
   */
  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }
    await this.authService.logoutAll(userId);
    ApiResponder.success(res, { message: 'Logged out from all devices' });
  });

  /**
   * Запит на відновлення пароля
   * POST /api/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const dto: ForgotPasswordDto = req.body;
    const result = await this.authService.forgotPassword(dto);
    ApiResponder.success(res, result);
  });

  /**
   * Скидання пароля
   * POST /api/auth/reset-password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const dto: ResetPasswordDto = req.body;
    await this.authService.resetPassword(dto);
    ApiResponder.success(res, { message: 'Password has been reset successfully' });
  });

  /**
   * Підтвердження email
   * POST /api/auth/verify-email
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const dto: VerifyEmailDto = req.body;
    await this.authService.verifyEmail(dto);
    ApiResponder.success(res, { message: 'Email verified successfully' });
  });
}

export default AuthController;
