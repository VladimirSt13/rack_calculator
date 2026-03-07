/**
 * Константи ролей та дозволів
 * 
 * Централізоване зберігання всіх ролей та їх дозволів
 */

/**
 * Доступні ролі в системі
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

/**
 * Типи цін в системі (тільки 3 типи)
 */
export const PRICE_TYPES = {
  BASE: 'базова',           // Ціна розрахована по прайсу
  NO_ISOLATORS: 'без_ізоляторів',  // Базова ціна мінус вартість ізоляторів
  ZERO: 'нульова',          // Базова ціна * 1,2 * 1,2
};

/**
 * Дозволи (permissions) в системі
 */
export const PERMISSIONS = {
  // Сторінки
  VIEW_RACK_PAGE: 'view_rack_page',
  VIEW_BATTERY_PAGE: 'view_battery_page',
  VIEW_ADMIN_PAGE: 'view_admin_page',
  
  // Дії
  CREATE_RACK_SET: 'create_rack_set',
  EDIT_RACK_SET: 'edit_rack_set',
  DELETE_RACK_SET: 'delete_rack_set',
  EXPORT_RACK_SET: 'export_rack_set',
  
  // Ціни
  VIEW_PRICE_RETAIL: 'view_price_retail',
  VIEW_PRICE_WHOLESALE: 'view_price_wholesale',
  VIEW_PRICE_COST: 'view_price_cost',
  VIEW_PRICE_ZERO: 'view_price_zero',
  EDIT_PRICE: 'edit_price',
  
  // Користувачі
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',
};

/**
 * Дозволи за замовчуванням для кожної ролі
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_RACK_PAGE,
    PERMISSIONS.VIEW_BATTERY_PAGE,
    PERMISSIONS.VIEW_ADMIN_PAGE,
    PERMISSIONS.CREATE_RACK_SET,
    PERMISSIONS.EDIT_RACK_SET,
    PERMISSIONS.DELETE_RACK_SET,
    PERMISSIONS.EXPORT_RACK_SET,
    PERMISSIONS.VIEW_PRICE_RETAIL,
    PERMISSIONS.VIEW_PRICE_WHOLESALE,
    PERMISSIONS.VIEW_PRICE_COST,
    PERMISSIONS.VIEW_PRICE_ZERO,
    PERMISSIONS.EDIT_PRICE,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.MANAGE_ROLES,
  ],
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.VIEW_BATTERY_PAGE,
    PERMISSIONS.CREATE_RACK_SET,
    PERMISSIONS.EXPORT_RACK_SET,
    PERMISSIONS.VIEW_PRICE_ZERO,
  ],
  [USER_ROLES.USER]: [],
};

/**
 * Типи цін доступні для кожної ролі
 */
export const ROLE_PRICE_TYPES = {
  [USER_ROLES.ADMIN]: [
    PRICE_TYPES.BASE,
    PRICE_TYPES.NO_ISOLATORS,
    PRICE_TYPES.ZERO,
  ],
  [USER_ROLES.MANAGER]: [
    PRICE_TYPES.ZERO,
  ],
  [USER_ROLES.USER]: [],
};

/**
 * Опис ролей для UI
 */
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: {
    label: 'Адміністратор',
    description: 'Повний доступ до всіх функцій системи',
  },
  [USER_ROLES.MANAGER]: {
    label: 'Менеджер',
    description: 'Доступ до сторінки "Акумулятор", нульові ціни',
  },
  [USER_ROLES.USER]: {
    label: 'Користувач',
    description: 'Обмежений доступ (після активації адміном)',
  },
};

/**
 * Перевірка чи має роль дозвіл
 */
export const hasPermission = (role, permission) => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

/**
 * Перевірка чи має роль доступ до типу ціни
 */
export const hasPriceType = (role, priceType) => {
  return ROLE_PRICE_TYPES[role]?.includes(priceType) ?? false;
};

/**
 * Отримати всі дозволи ролі
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] ?? [];
};

/**
 * Отримати всі типи цін ролі
 */
export const getRolePriceTypes = (role) => {
  return ROLE_PRICE_TYPES[role] ?? [];
};

/**
 * Валідація ролі
 */
export const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};

/**
 * Валідація дозволу
 */
export const isValidPermission = (permission) => {
  return Object.values(PERMISSIONS).includes(permission);
};

export default {
  USER_ROLES,
  PRICE_TYPES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_PRICE_TYPES,
  ROLE_DESCRIPTIONS,
  hasPermission,
  hasPriceType,
  getRolePermissions,
  getRolePriceTypes,
  isValidRole,
  isValidPermission,
};
