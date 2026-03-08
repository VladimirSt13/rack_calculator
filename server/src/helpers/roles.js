/**
 * Helper для роботи з ролями та permissions
 * Використовує константи з @/core/constants/roles
 */

import { USER_ROLES, PRICE_TYPES, ROLE_PERMISSIONS, ROLE_PRICE_TYPES } from '../core/constants/roles.js';
import { getDb } from '../db/index.js';

export { USER_ROLES, PRICE_TYPES, ROLE_PERMISSIONS, ROLE_PRICE_TYPES };

/**
 * Отримати permissions користувача з БД
 * @param {Object} user - Об'єкт користувача
 * @returns {Object} Permissions користувача
 */
export const getUserPermissions = async (user) => {
  if (!user) return {};

  // Отримуємо permissions з БД завжди
  try {
    const db = await getDb();

    // Спочатку пробуємо отримати з таблиці users
    const userData = db.prepare('SELECT permissions FROM users WHERE id = ?').get(user.userId || user.id);

    if (userData && userData.permissions) {
      return typeof userData.permissions === 'string'
        ? JSON.parse(userData.permissions)
        : userData.permissions;
    }

    // Якщо немає в users, отримуємо з role_price_types
    const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(user.role);

    if (!role) {
      return { price_types: [] };
    }

    const priceTypes = db.prepare(`
      SELECT price_type FROM role_price_types WHERE role_id = ?
    `).all(role.id);

    return {
      price_types: priceTypes.map(pt => pt.price_type),
    };
  } catch (error) {
    console.error('[Roles] Error getting permissions:', error.message);
    return { price_types: [] };
  }
};

/**
 * Отримати типи цін для користувача (зручний формат)
 * @param {Object} user - Об'єкт користувача
 * @returns {string[]} Масив типів цін
 */
export const getUserPriceTypes = async (user) => {
  const permissions = await getUserPermissions(user);
  return permissions.price_types || [];
};

/**
 * Отримати permissions користувача у форматі для фільтрації цін
 * @param {Object} user - Об'єкт користувача  
 * @returns {Object} Permissions у форматі { show_zero: boolean, ... }
 */
export const getUserPricePermissions = async (user) => {
  const priceTypes = await getUserPriceTypes(user);
  
  // Формуємо об'єкт permissions у зручному форматі
  return {
    show_zero: priceTypes.includes('нульова') || priceTypes.includes('zero'),
    show_no_isolators: priceTypes.includes('без_ізоляторів') || priceTypes.includes('no_isolators'),
    show_base: priceTypes.includes('базова') || priceTypes.includes('base'),
    show_retail: priceTypes.includes('роздрібна') || priceTypes.includes('retail'),
    show_wholesale: priceTypes.includes('оптова') || priceTypes.includes('wholesale'),
  };
};

/**
 * Перевірити чи має користувач доступ до типу ціни
 * @param {Object} user - Об'єкт користувача
 * @param {string} priceType - Тип ціни
 * @returns {boolean}
 */
export const hasPricePermission = (user, priceType) => {
  const permissions = getUserPermissions(user);
  return permissions.price_types?.includes(priceType) || false;
};

/**
 * Перевірити чи має користувач роль
 * @param {Object} user - Об'єкт користувача
 * @param  {...string} roles - Ролі для перевірки
 * @returns {boolean}
 */
export const hasRole = (user, ...roles) => {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
};

/**
 * Фільтрувати ціни за permissions користувача
 * @param {Object} priceData - Дані прайсу
 * @param {Object} permissions - Permissions користувача
 * @returns {Object} Відфільтрований прайс
 */
export const filterPricesByPermissions = (priceData, permissions) => {
  if (!permissions || !permissions.price_types) {
    return priceData;
  }
  
  // Для адміна повертаємо все
  if (permissions.price_types.includes('all')) {
    return priceData;
  }
  
  // Фільтрація за типами цін
  const filtered = { ...priceData };
  
  // Якщо немає доступу до "без ізоляторів", фільтруємо
  if (!permissions.price_types.includes(PRICE_TYPES.NO_ISOLATORS)) {
    // Логіка фільтрації залежить від структури priceData
  }
  
  // Якщо немає доступу до "загальна", фільтруємо
  if (!permissions.price_types.includes(PRICE_TYPES.RETAIL)) {
    // Логіка фільтрації
  }
  
  return filtered;
};

/**
 * Отримати всі доступні ролі з БД
 * @returns {Array}
 */
export const getAllRoles = async () => {
  try {
    const db = await getDb();
    return db.prepare(`
      SELECT id, name, label, description, is_default, is_active
      FROM roles
      WHERE is_active = 1
      ORDER BY name
    `).all();
  } catch (error) {
    console.error('[Roles] Error getting all roles:', error.message);
    return [];
  }
};

/**
 * Отримати дозволи ролі з БД
 * @param {string} roleName - Назва ролі
 * @returns {Array}
 */
export const getRolePermissionsFromDB = async (roleName) => {
  try {
    const db = await getDb();
    const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(roleName);
    
    if (!role) return [];
    
    return db.prepare(`
      SELECT p.name, p.label, p.category
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
    `).all(role.id);
  } catch (error) {
    console.error('[Roles] Error getting role permissions:', error.message);
    return [];
  }
};

/**
 * Оновити дозволи ролі
 * @param {string} roleName - Назва ролі
 * @param {Array} permissionNames - Список дозволів
 */
export const updateRolePermissions = async (roleName, permissionNames) => {
  try {
    const db = await getDb();
    const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(roleName);
    
    if (!role) throw new Error('Role not found');
    
    // Видаляємо старі дозволи
    db.prepare('DELETE FROM role_permissions WHERE role_id = ?').run(role.id);
    
    // Додаємо нові
    for (const permName of permissionNames) {
      const permission = db.prepare('SELECT id FROM permissions WHERE name = ?').get(permName);
      if (permission) {
        db.prepare(`
          INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)
        `).run(role.id, permission.id);
      }
    }
    
    return true;
  } catch (error) {
    console.error('[Roles] Error updating role permissions:', error.message);
    return false;
  }
};

/**
 * Оновити price types ролі
 * @param {string} roleName - Назва ролі
 * @param {Array} priceTypes - Список типів цін
 */
export const updateRolePriceTypes = async (roleName, priceTypes) => {
  try {
    const db = await getDb();
    const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(roleName);
    
    if (!role) throw new Error('Role not found');
    
    // Видаляємо старі price types
    db.prepare('DELETE FROM role_price_types WHERE role_id = ?').run(role.id);
    
    // Додаємо нові
    for (const priceType of priceTypes) {
      db.prepare(`
        INSERT INTO role_price_types (role_id, price_type) VALUES (?, ?)
      `).run(role.id, priceType);
    }
    
    return true;
  } catch (error) {
    console.error('[Roles] Error updating role price types:', error.message);
    return false;
  }
};

export default {
  USER_ROLES,
  PRICE_TYPES,
  getUserPermissions,
  hasPricePermission,
  hasRole,
  filterPricesByPermissions,
  getAllRoles,
  getRolePermissionsFromDB,
  updateRolePermissions,
  updateRolePriceTypes,
};
