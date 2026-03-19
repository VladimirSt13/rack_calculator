import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { jwtConfig } from '../../config/jwt.config';
import { TokenPair } from '../types';

/**
 * JWT Payload інтерфейс
 */
export interface JwtPayload {
  userId: string;
  email: string;
  roleId?: string;
  roleName?: string;
  permissions?: string[];
}

/**
 * Сервіс для роботи з JWT токенами
 */
export class JwtService {
  /**
   * Згенерувати пару токенів (access + refresh)
   */
  async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.accessTokenExpiresInSeconds,
    };
  }

  /**
   * Згенерувати access token
   */
  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    const options: SignOptions = {
      expiresIn: jwtConfig.accessTokenExpiresIn as StringValue,
    };
    return jwt.sign(payload, jwtConfig.secret, options);
  }

  /**
   * Згенерувати refresh token
   */
  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const options: SignOptions = {
      expiresIn: jwtConfig.refreshTokenExpiresIn as StringValue,
    };
    return jwt.sign(payload, jwtConfig.refreshSecret, options);
  }

  /**
   * Верифікувати access token
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(token, jwtConfig.secret) as JwtPayload;
      console.log('[JwtService] verifyAccessToken() payload:', {
        userId: payload.userId,
        email: payload.email,
        roleId: payload.roleId,
        roleName: payload.roleName,
        permissions: payload.permissions,
      });
      return payload;
    } catch (error) {
      console.error('[JwtService] verifyAccessToken() error:', error);
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Верифікувати refresh token
   */
  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Декодувати токен без верифікації
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}

export default JwtService;
