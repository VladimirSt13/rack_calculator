import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { Button } from '@/shared/components/Button';
import { AlertTriangle, Home, LogIn } from 'lucide-react';
import { PUBLIC_ROUTES } from '@/core/constants/routes';

export const AccessDeniedPage: React.FC = () => {
  const { user, accessToken } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/10 to-destructive/5">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border text-center">
        <div className="flex justify-center">
          <div className="p-3 bg-destructive rounded-full">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-destructive">Доступ заборонено</h1>

        {!accessToken ? (
          <>
            <p className="text-muted-foreground">
              Вам необхідно увійти в систему для отримання доступу
            </p>
            <Link to={PUBLIC_ROUTES.LOGIN}>
              <Button className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Увійти
              </Button>
            </Link>
          </>
        ) : user?.role === 'user' ? (
          <>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Увага!</strong> Ваш акаунт ще не активовано.
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                Будь ласка, зверніться до адміністратора для надання доступу до системи.
              </p>
            </div>

            <div className="space-y-2 text-left text-sm text-muted-foreground">
              <p>Для отримання доступу:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Зв'яжіться з адміністратором</li>
                <li>Надайте ваш email: <strong className="text-foreground">{user?.email}</strong></li>
                <li>Очікуйте підтвердження</li>
              </ol>
            </div>

            <Link to={PUBLIC_ROUTES.LOGIN}>
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                На головну
              </Button>
            </Link>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">
              У вас немає прав для перегляду цієї сторінки
            </p>
            <Link to={PUBLIC_ROUTES.LOGIN}>
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                На головну
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AccessDeniedPage;
