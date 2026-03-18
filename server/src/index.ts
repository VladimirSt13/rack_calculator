// Reflect metadata for decorators
import 'reflect-metadata';

import { createApp } from './app';
import { appConfig } from './config/app.config';

/**
 * Головна точка входу сервера
 */
const startServer = async () => {
  try {
    // Створення Express додатку
    const app = await createApp();

    // Запуск сервера
    app.listen(appConfig.port, () => {
      console.log('========================================');
      console.log(`🚀 Server running on port ${appConfig.port}`);
      console.log(`📝 Environment: ${appConfig.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${appConfig.port}/health`);
      console.log('========================================');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
};

// Запуск сервера
startServer();

export default startServer;
