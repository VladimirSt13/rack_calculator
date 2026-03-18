import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Для ES modules - отримуємо __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Завантажуємо .env з папки server
config({ path: resolve(__dirname, '../../.env') });

/**
 * Конфігурація додатку
 */
export const appConfig = {
  /** Режим роботи (development/production) */
  nodeEnv: process.env.NODE_ENV || 'development',

  /** Порт сервера */
  port: parseInt(process.env.PORT || '3001', 10),

  /** Хост сервера */
  host: process.env.HOST || 'localhost',

  /** CORS origin */
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  /** Rate limit window (ms) */
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),

  /** Rate limit max requests */
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};
