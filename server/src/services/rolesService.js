import { getDb } from '../db/index.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';
import {
  getAllRoles,
  getRolePermissionsFromDB,
  updateRolePermissions,
  updateRolePriceTypes,
} from '../helpers/roles.js';

/**
 * Сервис для работы с ролями
 */

/**
 * Получить все роли с разрешениями
 * @returns {Array} Список ролей с разрешениями
 */
export const getAllRolesWithPermissions = async () => {
  const roles = await getAllRoles();

  // Добавляем permissions к каждой роли
  const rolesWithPermissions = await Promise.all(
    roles.map(async (role) => ({
      ...role,
      permissions: await getRolePermissionsFromDB(role.name),
    }))
  );

  return rolesWithPermissions;
};

/**
 * Получить разрешения роли
 * @param {string} roleName - Название роли
 * @returns {Array} Список разрешений
 */
export const getRolePermissions = async (roleName) => {
  return await getRolePermissionsFromDB(roleName);
};

/**
 * Обновить разрешения роли
 * @param {string} roleName - Название роли
 * @param {Array} permissions - Список разрешений
 * @param {number} userId - ID пользователя, выполняющего действие
 * @param {string} ip - IP адрес
 * @param {string} userAgent - User agent
 * @returns {Object} Результат обновления
 */
export const updateRolePermissionsService = async (roleName, permissions, userId, ip, userAgent) => {
  if (!Array.isArray(permissions)) {
    throw new Error('Permissions must be an array');
  }

  const success = await updateRolePermissions(roleName, permissions);

  if (!success) {
    throw new Error('Failed to update permissions');
  }

  // Audit log
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.PERMISSION_CHANGE,
    entityType: ENTITY_TYPES.USER,
    newValue: { role: roleName, permissions },
    ipAddress: ip,
    userAgent,
  });

  return { message: 'Permissions updated successfully' };
};

/**
 * Получить типы цен роли
 * @param {string} roleName - Название роли
 * @returns {Array} Список типов цен
 */
export const getRolePriceTypes = async (roleName) => {
  const db = await getDb();

  const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(roleName);

  if (!role) {
    throw new Error('Role not found');
  }

  const priceTypes = db.prepare(`
    SELECT price_type FROM role_price_types WHERE role_id = ?
  `).all(role.id);

  return priceTypes.map(pt => pt.price_type);
};

/**
 * Обновить типы цен роли
 * @param {string} roleName - Название роли
 * @param {Array} priceTypes - Список типов цен
 * @param {number} userId - ID пользователя, выполняющего действие
 * @param {string} ip - IP адрес
 * @param {string} userAgent - User agent
 * @returns {Object} Результат обновления
 */
export const updateRolePriceTypesService = async (roleName, priceTypes, userId, ip, userAgent) => {
  if (!Array.isArray(priceTypes)) {
    throw new Error('Price types must be an array');
  }

  const success = await updateRolePriceTypes(roleName, priceTypes);

  if (!success) {
    throw new Error('Failed to update price types');
  }

  // Audit log
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.PERMISSION_CHANGE,
    entityType: ENTITY_TYPES.USER,
    newValue: { role: roleName, price_types: priceTypes },
    ipAddress: ip,
    userAgent,
  });

  return { message: 'Price types updated successfully' };
};

/**
 * Создать новую роль
 * @param {Object} roleData - Данные роли
 * @param {number} userId - ID пользователя, выполняющего действие
 * @param {string} ip - IP адрес
 * @param {string} userAgent - User agent
 * @returns {Object} Созданная роль
 */
export const createRole = async (roleData, userId, ip, userAgent) => {
  const { name, label, description, permissions, price_types } = roleData;
  const db = await getDb();

  // Проверка существует ли роль
  const existing = db.prepare('SELECT id FROM roles WHERE name = ?').get(name);
  if (existing) {
    throw new Error('Role already exists');
  }

  // Создание роли
  const result = db.prepare(`
    INSERT INTO roles (name, label, description, is_default, is_active)
    VALUES (?, ?, ?, 0, 1)
  `).run(name, label, description || '');

  const roleId = result.lastInsertRowid;

  // Добавление разрешений
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

  // Добавление price types
  if (price_types && Array.isArray(price_types)) {
    for (const priceType of price_types) {
      db.prepare(`
        INSERT INTO role_price_types (role_id, price_type) VALUES (?, ?)
      `).run(roleId, priceType);
    }
  }

  // Audit log
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.USER,
    entityId: Number(roleId),
    newValue: { name, label, description, permissions, price_types },
    ipAddress: ip,
    userAgent,
  });

  return {
    message: 'Role created successfully',
    role: { id: roleId, name, label, description },
  };
};

export default {
  getAllRolesWithPermissions,
  getRolePermissions,
  updateRolePermissionsService,
  getRolePriceTypes,
  updateRolePriceTypesService,
  createRole,
};
