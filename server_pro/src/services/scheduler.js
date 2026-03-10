import cron from 'node-cron';
import { config } from '../config/index.js';
import { getDb } from '../db/index.js';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Initialize scheduled tasks
 */
export const initCronJobs = () => {
  console.log('[Cron] Initializing scheduled tasks...');

  // Audit Cleanup
  if (config.cron.auditCleanup.enabled) {
    cron.schedule(config.cron.auditCleanup.schedule, () => {
      console.log('[Cron] Running audit cleanup...');
      const deleted = cleanupAudit(config.cron.auditCleanup.days);
      console.log(`[Cron] Deleted ${deleted} old audit records`);
    });
    console.log(`[Cron] Audit cleanup scheduled: ${config.cron.auditCleanup.schedule}`);
  }

  // Token Cleanup
  if (config.cron.tokenCleanup.enabled) {
    cron.schedule(config.cron.tokenCleanup.schedule, () => {
      console.log('[Cron] Running token cleanup...');
      const deleted = RefreshToken.cleanupExpiredTokens(config.cron.tokenCleanup.days);
      console.log(`[Cron] Deleted ${deleted} expired tokens`);
    });
    console.log(`[Cron] Token cleanup scheduled: ${config.cron.tokenCleanup.schedule}`);
  }

  // Deleted Records Cleanup
  if (config.cron.deletedCleanup.enabled) {
    cron.schedule(config.cron.deletedCleanup.schedule, () => {
      console.log('[Cron] Running deleted records cleanup...');
      const deleted = cleanupDeletedRecords(config.cron.deletedCleanup.days);
      console.log(`[Cron] Deleted ${deleted} old records`);
    });
    console.log(`[Cron] Deleted cleanup scheduled: ${config.cron.deletedCleanup.schedule}`);
  }
};

/**
 * Cleanup old audit logs
 */
const cleanupAudit = (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = getDb().prepare(`
      DELETE FROM audit_log WHERE created_at < ?
    `).run(cutoffDate.toISOString());

    return result.changes;
  } catch (error) {
    console.error('[Audit Cleanup Error]', error);
    return 0;
  }
};

/**
 * Cleanup soft-deleted records
 */
const cleanupDeletedRecords = (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let totalDeleted = 0;

    // Cleanup deleted users (if soft delete is implemented)
    // const usersResult = getDb().prepare(`
    //   DELETE FROM users WHERE deleted = 1 AND deleted_at < ?
    // `).run(cutoffDate.toISOString());
    // totalDeleted += usersResult.changes;

    // Add more tables as needed

    return totalDeleted;
  } catch (error) {
    console.error('[Deleted Cleanup Error]', error);
    return 0;
  }
};

export default initCronJobs;
