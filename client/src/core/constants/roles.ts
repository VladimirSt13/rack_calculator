/**
 * Константи ролей та дозволів для клієнта
 */

/**
 * Доступні ролі в системі
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Типи цін в системі (тільки 3 типи)
 */
export const PRICE_TYPES = {
  BASE: 'базова',           // Ціна розрахована по прайсу
  NO_ISOLATORS: 'без_ізоляторів',  // Базова ціна мінус вартість ізоляторів
  ZERO: 'нульова',          // Базова ціна * 1,2 * 1,2
} as const;

export type PriceType = typeof PRICE_TYPES[keyof typeof PRICE_TYPES];

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
  EDIT_PRICE: 'edit_price',
  
  // Користувачі
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

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
} as const;

/**
 * Перевірка чи має користувач роль
 */
export const hasRole = (userRole: UserRole | null | undefined, roles: UserRole[]): boolean => {
  if (!userRole) return false;
  return roles.includes(userRole);
};

/**
 * Перевірка чи має користувач доступ до сторінки
 */
export const canAccessPage = (userRole: UserRole | null | undefined, page: string): boolean => {
  if (!userRole) return false;
  
  switch (page) {
    case 'rack':
      return userRole === USER_ROLES.ADMIN;
    case 'battery':
      return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.MANAGER;
    case 'admin':
      return userRole === USER_ROLES.ADMIN;
    default:
      return false;
  }
};

export default {
  USER_ROLES,
  PRICE_TYPES,
  PERMISSIONS,
  ROLE_DESCRIPTIONS,
  hasRole,
  canAccessPage,
};
