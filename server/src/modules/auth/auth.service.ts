import bcrypt from 'bcryptjs';
import { JwtService } from '../../common/utils/jwt.service';
import { AuthRepository } from './auth.repository';
import {
  LoginServiceInput,
  RegisterServiceInput,
  RefreshTokenServiceInput,
  ForgotPasswordServiceInput,
  ResetPasswordServiceInput,
  VerifyEmailServiceInput,
  AuthResult,
  TokenPair,
  AuthError,
} from './auth.types';

/**
 * Auth Service
 * Відповідає за бізнес-логіку авторизації
 */
export class AuthService {
  private authRepository: AuthRepository;
  private jwtService: JwtService;

  constructor(authRepository: AuthRepository, jwtService: JwtService) {
    this.authRepository = authRepository;
    this.jwtService = jwtService;
  }

  // ==========================================
  // LOGIN
  // ==========================================

  /**
   * Логін користувача
   */
  async login(input: LoginServiceInput): Promise<AuthResult> {
    // Знайти користувача з паролем, роллю та дозволами
    const user = await this.authRepository.findByEmail({
      email: input.email,
      includePassword: true,
      includeRole: true,
      includePermissions: true,
    });

    // Перевірка чи користувач існує
    if (!user) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Перевірка пароля
    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Перевірка чи підтверджено email (опціонально)
    // if (!user.emailVerified) {
    //   throw new AuthError('Email not verified', 'EMAIL_NOT_VERIFIED');
    // }

    // Генерація токенів
    const tokens = await this.generateTokens(user);

    // Збереження refresh token
    await this.authRepository.createRefreshToken({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Повернення результату
    return {
      user: {
        id: user._id.toHexString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (user.roleId as any)?.name || 'user',
        roleName: (user.roleId as any)?.name || 'user', // Дублюємо для зручності клієнта
        permissions: (user.roleId as any)?.permissions?.map((p: any) => p.name) || [],
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  // ==========================================
  // REGISTER
  // ==========================================

  /**
   * Реєстрація нового користувача
   */
  async register(input: RegisterServiceInput): Promise<AuthResult> {
    // Перевірка чи користувач вже існує
    const existingUser = await this.authRepository.findByEmail({
      email: input.email,
    });

    if (existingUser) {
      throw new AuthError('Email already registered', 'USER_EXISTS');
    }

    // Хешування пароля
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Створення користувача
    const user = await this.authRepository.createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    // Генерація токенів
    const tokens = await this.generateTokens(user);

    // Збереження refresh token
    await this.authRepository.createRefreshToken({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Створення запису для підтвердження email
    await this.createEmailVerificationRecord(user);

    return {
      user: {
        id: user._id.toHexString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'user',
        permissions: [],
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  // ==========================================
  // REFRESH TOKEN
  // ==========================================

  /**
   * Оновлення токенів
   */
  async refreshToken(input: RefreshTokenServiceInput): Promise<AuthResult> {
    // Знайти refresh token в БД
    const refreshTokenDoc = await this.authRepository.findRefreshToken(input.refreshToken);

    if (!refreshTokenDoc) {
      throw new AuthError('Invalid refresh token', 'TOKEN_INVALID');
    }

    // Перевірка чи токен не закінчився
    if (refreshTokenDoc.isExpired?.()) {
      await this.authRepository.deleteRefreshToken(input.refreshToken);
      throw new AuthError('Refresh token expired', 'TOKEN_EXPIRED');
    }

    // Знайти користувача
    const user = await this.authRepository.findById(refreshTokenDoc.userId.toHexString());

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Завантажити роль та дозволи
    const userWithRole = await this.authRepository.findByEmail({
      email: user.email,
      includeRole: true,
      includePermissions: true,
    });

    // Генерація нових токенів
    const tokens = await this.generateTokens(user);

    // Видалити старий refresh token і зберегти новий
    await this.authRepository.deleteRefreshToken(input.refreshToken);
    await this.authRepository.createRefreshToken({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user._id.toHexString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (userWithRole?.roleId as any)?.name || 'user',
        permissions: (userWithRole?.roleId as any)?.permissions?.map((p: any) => p.name) || [],
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  /**
   * Вихід користувача
   */
  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(refreshToken);
  }

  /**
   * Вихід з усіх пристроїв
   */
  async logoutAll(userId: string): Promise<void> {
    await this.authRepository.deleteUserTokens(userId);
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  /**
   * Запит на відновлення пароля
   */
  async forgotPassword(input: ForgotPasswordServiceInput): Promise<{ message: string }> {
    // Знайти користувача
    const user = await this.authRepository.findByEmail({
      email: input.email,
    });

    // Не показуємо чи існує користувач (безпека)
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Видалити старі токени
    await this.authRepository.deleteUserPasswordResets(user._id);

    // Згенерувати токен
    const token = await this.generateResetToken();

    // Створити запис скидання пароля
    await this.authRepository.createPasswordReset({
      userId: user._id,
      email: user.email,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // TODO: Відправити email з токеном
    // await sendPasswordResetEmail(user.email, token);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  /**
   * Скидання пароля
   */
  async resetPassword(input: ResetPasswordServiceInput): Promise<void> {
    // Знайти запис скидання пароля
    const resetRecord = await this.authRepository.findPasswordReset(input.token);

    if (!resetRecord) {
      throw new AuthError('Invalid reset token', 'TOKEN_INVALID');
    }

    // Перевірка чи токен не закінчився
    if (resetRecord.isExpired?.()) {
      await this.authRepository.deleteUserPasswordResets(resetRecord.userId);
      throw new AuthError('Reset token expired', 'TOKEN_EXPIRED');
    }

    // Хешування нового пароля
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Оновлення пароля
    await this.authRepository.update(resetRecord.userId, { passwordHash });

    // Позначити токен як використаний
    await this.authRepository.markPasswordResetAsUsed(input.token);

    // Видалити всі refresh токени користувача
    await this.authRepository.deleteUserTokens(resetRecord.userId);
  }

  // ==========================================
  // VERIFY EMAIL
  // ==========================================

  /**
   * Підтвердження email
   */
  async verifyEmail(input: VerifyEmailServiceInput): Promise<void> {
    // Знайти запис підтвердження
    const verification = await this.authRepository.findEmailVerification(input.token);

    if (!verification) {
      throw new AuthError('Invalid verification token', 'TOKEN_INVALID');
    }

    // Перевірка чи токен не закінчився
    if (verification.isExpired?.()) {
      await this.authRepository.deleteUserEmailVerifications(verification.userId);
      throw new AuthError('Verification token expired', 'TOKEN_EXPIRED');
    }

    // Позначити email як підтверджений
    await this.authRepository.markEmailAsVerified(verification.userId);

    // Видалити запис підтвердження
    await this.authRepository.deleteUserEmailVerifications(verification.userId);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Згенерувати пару токенів для користувача
   */
  private async generateTokens(user: any): Promise<TokenPair> {
    // Отримуємо roleId та roleName
    let roleId: string | undefined;
    let roleName: string | undefined;

    if (user.roleId) {
      if (typeof user.roleId.toHexString === 'function') {
        // Це ObjectId (не populate-нутий)
        roleId = user.roleId.toHexString();
        roleName = undefined; // Назву ролі отримаємо з БД при наступному запиті
      } else if (user.roleId._id) {
        // Це populate-нутий об'єкт Role
        roleId = user.roleId._id.toHexString();
        roleName = user.roleId.name?.toLowerCase() || 'user';
      } else {
        // Це вже рядок
        roleId = user.roleId;
        roleName = undefined;
      }
    }

    return this.jwtService.generateTokenPair({
      userId: user._id.toHexString(),
      email: user.email,
      roleId,
      roleName: roleName || 'user',
      permissions: (user.roleId as any)?.permissions?.map((p: any) => p.name) || [],
    });
  }

  /**
   * Створити запис для підтвердження email
   */
  private async createEmailVerificationRecord(user: any): Promise<void> {
    const token = await this.generateVerificationToken();

    await this.authRepository.createEmailVerification({
      userId: user._id,
      email: user.email,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // TODO: Відправити email з токеном
    // await sendVerificationEmail(user.email, token);
  }

  /**
   * Згенерувати токен для скидання пароля
   */
  private async generateResetToken(): Promise<string> {
    return this.generateRandomToken(32);
  }

  /**
   * Згенерувати токен для підтвердження email
   */
  private async generateVerificationToken(): Promise<string> {
    return this.generateRandomToken(32);
  }

  /**
   * Згенерувати випадковий токен
   */
  private async generateRandomToken(length: number): Promise<string> {
    const crypto = require('crypto');
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (err: Error, buf: Buffer) => {
        if (err) reject(err);
        resolve(buf.toString('hex'));
      });
    });
  }
}

export default AuthService;
