import { Navigate } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { PUBLIC_ROUTES } from '@/core/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Перевірка за роллю (для зворотної сумісності)
   * Використовуй permissions замість цього
   */
  allowedRoles?: string[];
  /**
   * Перевірка за дозволами
   * Користувач повинен мати хоча б один дозвіл зі списку
   */
  requiredPermissions?: string[];
  /**
   * Користувач повинен мати всі дозволи зі списку
   */
  requiredAllPermissions?: string[];
  /**
   * Вимагає активної ролі (не 'user')
   */
  requireActive?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  requiredAllPermissions,
  requireActive = false,
}) => {
  const { user, accessToken, hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } = useAuthStore();

  // Якщо немає токену - редірект на login
  if (!accessToken) {
    return <Navigate to={PUBLIC_ROUTES.LOGIN} replace />;
  }

  // Якщо завантажується користувач - показуємо лоадер
  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  // Адмін проходить будь-яку перевірку
  if (isAdmin()) {
    return <>{children}</>;
  }

  // Перевірка за дозволами (пріоритет)
  if (requiredAllPermissions) {
    if (!hasAllPermissions(requiredAllPermissions)) {
      return <Navigate to={PUBLIC_ROUTES.ACCESS_DENIED} replace />;
    }
  }

  if (requiredPermissions) {
    if (!hasAnyPermission(requiredPermissions)) {
      return <Navigate to={PUBLIC_ROUTES.ACCESS_DENIED} replace />;
    }
  }

  // Перевірка за роллю (для зворотної сумісності)
  if (allowedRoles && !allowedRoles.includes(user.roleName)) {
    return <Navigate to={PUBLIC_ROUTES.ACCESS_DENIED} replace />;
  }

  // Якщо роль 'user' і вимагається активна роль - редірект на access-denied
  if (requireActive && user.roleName === 'user') {
    return <Navigate to={PUBLIC_ROUTES.ACCESS_DENIED} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
