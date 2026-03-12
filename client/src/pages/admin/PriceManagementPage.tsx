import { Alert, AlertDescription, AlertTitle } from '@/shared/components/Alert';
import { AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/shared/layout/AdminLayout';

export const PriceManagementPage: React.FC = () => {
  return (
    <AdminLayout
      title="Управління прайсом"
      description="Завантаження та оновлення прайс-листу"
    >
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>В розробці</AlertTitle>
        <AlertDescription>
          Ця сторінка знаходиться в процесі розробки.
          Для оновлення прайсу зверніться до адміністратора системи.
        </AlertDescription>
      </Alert>

      <div className="mt-6 p-6 bg-card rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Як оновити прайс:</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Підготуйте файл з прайсом у форматі Excel (.xlsx)</li>
          <li>Зверніться до відповідального за оновлення цін</li>
          <li>Після оновлення всі розрахунки будуть перераховані автоматично</li>
        </ol>
      </div>
    </AdminLayout>
  );
};

export default PriceManagementPage;
