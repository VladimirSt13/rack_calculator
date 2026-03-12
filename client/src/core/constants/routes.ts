/**
 * Константи маршрутів
 * 
 * Централізоване зберігання всіх маршрутів додатку
 */

/**
 * Публічні маршрути (доступні без авторизації)
 */
export const PUBLIC_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCESS_DENIED: '/access-denied',
} as const;

/**
 * Основні маршрути (вимагають авторизації)
 */
export const PROTECTED_ROUTES = {
  HOME: '/',
  RACK: '/rack',
  BATTERY: '/battery',
} as const;

/**
 * Адмін маршрути (тільки для admin)
 */
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  RACK_SETS: '/admin/rack-sets',
  PRICE: '/admin/price',
} as const;

/**
 * Всі маршрути додатку
 */
export const ALL_ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  ...ADMIN_ROUTES,
} as const;

/**
 * Налаштування маршрутів для навігації
 */
export const NAVIGATION_ROUTES = {
  ADMIN: {
    path: PROTECTED_ROUTES.RACK,
    label: 'Стелаж',
    roles: ['admin'],
  },
  BATTERY: {
    path: PROTECTED_ROUTES.BATTERY,
    label: 'Акумулятор',
    roles: ['admin', 'manager'],
  },
} as const;

/**
 * Маршрут за замовчуванням після входу
 */
export const DEFAULT_REDIRECT_ROUTE = '/dashboard';

/**
 * Маршрут за замовчуванням для адміна
 */
export const ADMIN_DEFAULT_REDIRECT = ADMIN_ROUTES.DASHBOARD;

/**
 * Перевірка чи є маршрут публічним
 */
export const isPublicRoute = (path: string): boolean => {
  return Object.values(PUBLIC_ROUTES).includes(path as any);
};

/**
 * Перевірка чи є маршрут адмінським
 */
export const isAdminRoute = (path: string): boolean => {
  return Object.values(ADMIN_ROUTES).some(route => path.startsWith(route));
};

/**
 * Отримати маршрут за назвою
 */
export const getRouteByName = (name: keyof typeof ALL_ROUTES): string => {
  return ALL_ROUTES[name];
};

export default ALL_ROUTES;
