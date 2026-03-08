import { Alert, AlertDescription, AlertTitle } from '@/shared/components/Alert';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';

export const RolesManagementPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ролі та дозволи</h1>
        <p className="text-muted-foreground">
          Управління ролями та дозволами користувачів
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>В розробці</AlertTitle>
        <AlertDescription>
          Ця сторінка знаходиться в процесі розробки. 
          Для зміни ролей користувачів використовуйте сторінку "Користувачі".
        </AlertDescription>
      </Alert>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Поточна роль</h2>
          <p className="text-2xl font-bold capitalize mb-2">{user?.role}</p>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'admin' && 'Повний доступ до всіх функцій'}
            {user?.role === 'manager' && 'Доступ до розрахунку батарей'}
            {user?.role === 'user' && 'Обмежений доступ'}
          </p>
        </div>

        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Доступні дії</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Перегляд користувачів
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Зміна ролі через UserManagement
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-600">⚠</span>
              Налаштування дозволів (скоро)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RolesManagementPage;
