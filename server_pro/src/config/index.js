import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, '../../.env')
});

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3001,
  host: process.env.HOST || 'localhost',
  
  // Database
  dbPath: process.env.DB_PATH || './data/app.db',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  
  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'App <noreply@example.com>',
  },
  
  // Cron
  cron: {
    auditCleanup: {
      enabled: process.env.AUDIT_CLEANUP_ENABLED === 'true',
      schedule: process.env.AUDIT_CLEANUP_SCHEDULE || '0 2 * * 0',
      days: parseInt(process.env.AUDIT_CLEANUP_DAYS) || 90,
    },
    tokenCleanup: {
      enabled: process.env.TOKEN_CLEANUP_ENABLED === 'true',
      schedule: process.env.TOKEN_CLEANUP_SCHEDULE || '0 3 * * 0',
      days: parseInt(process.env.TOKEN_CLEANUP_DAYS) || 30,
    },
    deletedCleanup: {
      enabled: process.env.DELETED_CLEANUP_ENABLED === 'true',
      schedule: process.env.DELETED_CLEANUP_SCHEDULE || '0 4 * * 0',
      days: parseInt(process.env.DELETED_CLEANUP_DAYS) || 30,
    },
  },
};

export default config;
