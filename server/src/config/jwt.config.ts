import { config } from 'dotenv';

config();

/**
 * JWT конфігурація
 */
export const jwtConfig = {
  /** Secret для access token */
  secret: process.env.JWT_SECRET || 'change-me-to-secure-random-string-min-32-chars',

  /** Secret для refresh token */
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-to-secure-refresh-string-min-32-chars',

  /** Час життя access token */
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',

  /** Час життя refresh token */
  refreshTokenExpiresIn: '7d',

  /** Час життя access token в секундах (для відповіді клієнту) */
  accessTokenExpiresInSeconds: 900, // 15 minutes
};
