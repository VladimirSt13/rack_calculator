import { Navigate } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { PUBLIC_ROUTES } from '@/core/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manager' | 'user')[];
  requireActive?: boolean; // Вимагає активної ролі (не 'user')
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireActive = false,
}) => {
  const { user, accessToken } = useAuthStore();

  // Якщо немає токену - редірект на login
  if (!accessToken) {
    return <Navigate to={PUBLIC_ROUTES.LOGIN} replace />;
  }

  // Якщо завантажується користувач - показуємо лоадер
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Якщо потрібна конкретна роль і користувач не має її
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={PUBLIC_ROUTES.ACCESS_DENIED} replace />;
  }

  // Якщо роль 'user' і вимагається активна роль - редірект на access-denied
  if (requireActive && user.role === 'user') {
    return <Navigate to={PUBLIC_ROUTES.ACCESS_DENIED} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
