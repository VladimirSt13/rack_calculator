import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import {
  getAllRoles,
  getRolePermissionsFromDB,
  updateRolePermissions,
  updateRolePriceTypes,
} from '../helpers/roles.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';

const router = Router();

/**
 * GET /api/roles
 * Отримати всі ролі
 */
router.get('/', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const roles = await getAllRoles();

    // Додаємо permissions до кожної ролі
    const rolesWithPermissions = await Promise.all(roles.map(async (role) => ({
      ...role,
      permissions: await getRolePermissionsFromDB(role.name),
    })));

    res.json({ roles: rolesWithPermissions });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/roles/:name/permissions
 * Отримати дозволи ролі
 */
router.get('/:name/permissions', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { name } = req.params;
    const permissions = getRolePermissionsFromDB(name);
    
    res.json({ permissions });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/roles/:name/permissions
 * Оновити дозволи ролі
 */
router.put('/:name/permissions', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { name } = req.params;
    const { permissions } = req.body;
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }
    
    const success = await updateRolePermissions(name, permissions);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update permissions' });
    }
    
    // Audit log
    await logAudit({
      userId: req.user.userId,
      action: AUDIT_ACTIONS.PERMISSION_CHANGE,
      entityType: ENTITY_TYPES.USER,
      newValue: { role: name, permissions },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/roles/:name/price-types
 * Отримати типи цін ролі
 */
router.get('/:name/price-types', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { name } = req.params;
    const db = await getDb();
    
    const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(name);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const priceTypes = db.prepare(`
      SELECT price_type FROM role_price_types WHERE role_id = ?
    `).all(role.id);
    
    res.json({ price_types: priceTypes.map(pt => pt.price_type) });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/roles/:name/price-types
 * Оновити типи цін ролі
 */
router.put('/:name/price-types', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { name } = req.params;
    const { price_types } = req.body;
    
    if (!Array.isArray(price_types)) {
      return res.status(400).json({ error: 'Price types must be an array' });
    }
    
    const success = await updateRolePriceTypes(name, price_types);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update price types' });
    }
    
    // Audit log
    await logAudit({
      userId: req.user.userId,
      action: AUDIT_ACTIONS.PERMISSION_CHANGE,
      entityType: ENTITY_TYPES.USER,
      newValue: { role: name, price_types },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({ message: 'Price types updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/roles
 * Створити нову роль
 */
router.post('/', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { name, label, description, permissions, price_types } = req.body;
    const db = await getDb();
    
    // Перевірка чи роль вже існує
    const existing = db.prepare('SELECT id FROM roles WHERE name = ?').get(name);
    if (existing) {
      return res.status(409).json({ error: 'Role already exists' });
    }
    
    // Створення ролі
    const result = db.prepare(`
      INSERT INTO roles (name, label, description, is_default, is_active)
      VALUES (?, ?, ?, 0, 1)
    `).run(name, label, description || '');
    
    const roleId = result.lastInsertRowid;
    
    // Додавання дозволів
    if (permissions && Array.isArray(permissions)) {
      for (const permName of permissions) {
        const permission = db.prepare('SELECT id FROM permissions WHERE name = ?').get(permName);
        if (permission) {
          db.prepare(`
            INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)
          `).run(roleId, permission.id);
        }
      }
    }
    
    // Додавання price types
    if (price_types && Array.isArray(price_types)) {
      for (const priceType of price_types) {
        db.prepare(`
          INSERT INTO role_price_types (role_id, price_type) VALUES (?, ?)
        `).run(roleId, priceType);
      }
    }
    
    // Audit log
    await logAudit({
      userId: req.user.userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.USER,
      entityId: Number(roleId),
      newValue: { name, label, description, permissions, price_types },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.status(201).json({
      message: 'Role created successfully',
      role: { id: roleId, name, label, description },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
