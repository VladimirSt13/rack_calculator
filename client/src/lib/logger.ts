/**
 * Logging utility для централізованого логування
 *
 * Використання:
 * - logger.debug() - для налагодження (вимикається в production)
 * - logger.info() - для інформаційних повідомлень
 * - logger.warn() - для попереджень
 * - logger.error() - для помилок
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    } else {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]) => {
    console.error(...args);
  },
};

export default logger;
