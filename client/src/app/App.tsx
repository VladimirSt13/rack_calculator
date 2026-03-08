import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeToggle, Toaster } from '@/shared/components';
import { UserMenu } from '@/features/auth/UserMenu';
import { useAuthStore } from '@/features/auth/authStore';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { PROTECTED_ROUTES, PUBLIC_ROUTES, DEFAULT_REDIRECT_ROUTE, NAVIGATION_ROUTES } from '@/core/constants/routes';
import RackPage from '@/pages/RackPage';
import BatteryPage from '@/pages/BatteryPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import RackSetsList from '@/pages/admin/RackSetsList';
import AuditLogPage from '@/pages/admin/AuditLogPage';
import PriceManagementPage from '@/pages/admin/PriceManagementPage';
import RolesManagementPage from '@/pages/admin/RolesManagementPage';
import MyRackSetsPage from '@/pages/MyRackSetsPage';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 хвилин
      retry: 1,
    },
  },
});

// Header компонент з навігацією та автентифікацією
const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, accessToken } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="header__brand">
          <h1 className="text-xl sm:text-2xl font-semibold mb-0">Акку-енерго</h1>
          <p className="text-xs sm:text-sm opacity-80 m-0">Калькулятор стелажів</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="header__nav" aria-label="Головна навігація">
            <ul className="flex list-none gap-2 sm:gap-4 m-0 p-0">
              {/* Мої комплекти - для всіх */}
              <li key="/my-sets">
                <Link
                  to="/my-sets"
                  className={cn(
                    'px-3 py-2 rounded-md transition-fast font-medium text-sm sm:text-base',
                    location.pathname === '/my-sets'
                      ? 'bg-primary-foreground/10 text-primary-foreground underline'
                      : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  )}
                >
                  Мої комплекти
                </Link>
              </li>
              {/* Rack - тільки для admin */}
              {user?.role === 'admin' && (
                <li key={PROTECTED_ROUTES.RACK}>
                  <Link
                    to={PROTECTED_ROUTES.RACK}
                    className={cn(
                      'px-3 py-2 rounded-md transition-fast font-medium text-sm sm:text-base',
                      location.pathname === PROTECTED_ROUTES.RACK
                        ? 'bg-primary-foreground/10 text-primary-foreground underline'
                        : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                    )}
                  >
                    {NAVIGATION_ROUTES.ADMIN.label}
                  </Link>
                </li>
              )}
              {/* Battery - для admin та manager */}
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <li key={PROTECTED_ROUTES.BATTERY}>
                  <Link
                    to={PROTECTED_ROUTES.BATTERY}
                    className={cn(
                      'px-3 py-2 rounded-md transition-fast font-medium text-sm sm:text-base',
                      location.pathname === PROTECTED_ROUTES.BATTERY
                        ? 'bg-primary-foreground/10 text-primary-foreground underline'
                        : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                    )}
                  >
                    {NAVIGATION_ROUTES.BATTERY.label}
                  </Link>
                </li>
              )}
              {/* Admin - тільки для admin */}
              {user?.role === 'admin' && (
                <li key="/admin">
                  <Link
                    to="/admin"
                    className={cn(
                      'px-3 py-2 rounded-md transition-fast font-medium text-sm sm:text-base',
                      location.pathname.startsWith('/admin')
                        ? 'bg-primary-foreground/10 text-primary-foreground underline'
                        : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                    )}
                  >
                    Адмін
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {accessToken && user && (
            <div className="flex items-center gap-2">
              {/* User Menu */}
              <UserMenu />
              
              {/* Кнопка виходу для мобільних */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
                title="Вийти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

          <ThemeToggle size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" />
        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const { accessToken, checkAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Перевірка авторизації при першому завантаженні
  React.useEffect(() => {
    if (accessToken) {
      checkAuth().finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  // Показуємо лоадер під час перевірки авторизації
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app min-h-screen flex flex-col bg-background">
          <Header />
          <main className="main flex-1">
            <Routes>
              {/* Публічні маршрути */}
              <Route path={PUBLIC_ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={PUBLIC_ROUTES.REGISTER} element={<RegisterPage />} />
              <Route path={PUBLIC_ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
              <Route path={PUBLIC_ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
              <Route path={PUBLIC_ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
              <Route path={PUBLIC_ROUTES.ACCESS_DENIED} element={<AccessDeniedPage />} />

              {/* Профіль користувача */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireActive>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Адмін маршрути */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']} requireActive>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']} requireActive>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rack-sets"
                element={
                  <ProtectedRoute allowedRoles={['admin']} requireActive>
                    <RackSetsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedRoute allowedRoles={['admin']} requireActive>
                    <AuditLogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/price"
                element={
                  <ProtectedRoute allowedRoles={['admin']} requireActive>
                    <PriceManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <ProtectedRoute allowedRoles={['admin']} requireActive>
                    <RolesManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Сторінка "Мої комплекти" для всіх користувачів */}
              <Route
                path="/my-sets"
                element={
                  <ProtectedRoute requireActive>
                    <MyRackSetsPage />
                  </ProtectedRoute>
                }
              />

              {/* Захищені маршрути */}
              <Route
                path={PROTECTED_ROUTES.HOME}
                element={
                  <ProtectedRoute requireActive>
                    <Navigate to={DEFAULT_REDIRECT_ROUTE} replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path={PROTECTED_ROUTES.RACK}
                element={
                  <ProtectedRoute allowedRoles={['admin']} requireActive>
                    <RackPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={PROTECTED_ROUTES.BATTERY}
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']} requireActive>
                    <BatteryPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<Navigate to={DEFAULT_REDIRECT_ROUTE} replace />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
