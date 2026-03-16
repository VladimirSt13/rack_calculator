import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { appConfig } from './config/app.config';
import { initDatabase } from './database';
import { errorMiddleware } from './common/middleware/error.middleware';

// Import modules routes
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { rolesRoutes } from './modules/roles/roles.routes';
import { pricesRoutes } from './modules/prices/prices.routes';
import { rackConfigurationsRoutes } from './modules/rack-configurations/rack-configurations.routes';
import { rackSetsRoutes } from './modules/rack-sets/rack-sets.routes';
import { calculationsRoutes } from './modules/calculations/calculations.routes';
import { batteryRoutes } from './modules/battery/battery.routes';
import { exportRoutes } from './modules/export/export.routes';
import { auditRoutes } from './modules/audit/audit.routes';

/**
 * Створення Express додатку
 */
export const createApp = async (): Promise<Application> => {
  // Ініціалізація бази даних
  await initDatabase();

  // Створення Express додатку
  const app = express();

  // Middleware
  app.use(helmet()); // Security headers
  app.use(cors({ origin: appConfig.corsOrigin, credentials: true })); // CORS
  app.use(compression()); // Gzip compression
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/roles', rolesRoutes);
  app.use('/api/prices', pricesRoutes);
  app.use('/api/rack-configurations', rackConfigurationsRoutes);
  app.use('/api/rack-sets', rackSetsRoutes);
  app.use('/api/calculations', calculationsRoutes);
  app.use('/api/battery', batteryRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/audit', auditRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  // Error handling middleware
  app.use(errorMiddleware);

  return app;
};

export default createApp;
