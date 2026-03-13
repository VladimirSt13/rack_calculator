import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import { rackSetsApi } from '@/features/rack/rackSetsApi';
import { Package, Calculator, Battery, Archive, TrendingUp, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/Dialog';
import { Label } from '@/shared/components/Label';
import { RackItemDisplay } from '@/shared/components/RackItemDisplay';
import { useState } from 'react';
import type { RackSet } from '@/features/rack/rackSetsApi';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [viewingSet, setViewingSet] = useState<RackSet | null>(null);

  // Отримуємо дані про комплекти
  const { data: setsData } = useQuery({
    queryKey: ['myRackSets'],
    queryFn: rackSetsApi.getAll,
  });

  // Фільтруємо тільки свої комплекти
  const mySets = setsData?.rackSets?.filter((set) => set.user_id === user?.id) || [];
  
  // Останні 5 комплектів
  const recentSets = mySets
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Статистика
  const stats = {
    totalSets: mySets.length,
    totalRacks: mySets.reduce((sum, set) => sum + (set.racks?.reduce((s, r) => s + (r.quantity || 1), 0) || 0), 0),
    totalCost: mySets.reduce((sum, set) => sum + (set.total_cost_snapshot || set.total_cost || 0), 0),
  };

  const userName = user?.email?.split('@')[0] || 'Користувач';

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Привітання */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Вітаємо, {userName}! 👋</h1>
        <p className="text-muted-foreground">
          Ласкаво просимо до системи розрахунку стелажів Акку-енерго
        </p>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього комплектів</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Збережених комплектів стелажів
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього стелажів</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRacks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              У всіх комплектах
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Загальна вартість</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCost.toFixed(2)} ₴</div>
            <p className="text-xs text-muted-foreground mt-1">
              За нульовою ціною
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Швидкий доступ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Калькулятор стелажів
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Розрахунок стелажів для довільних розмірів
            </p>
            <Button
              onClick={() => navigate('/rack')}
              className="w-full"
            >
              Розрахувати
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="w-5 h-5" />
              Підбір для батареї
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Автоматичний підбір стелажа для акумуляторів
            </p>
            <Button
              onClick={() => navigate('/battery')}
              className="w-full"
              variant="outline"
            >
              Підібрати
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Мої комплекти
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Перегляд та управління збереженими комплектами
            </p>
            <Button
              onClick={() => navigate('/my-sets')}
              className="w-full"
              variant="outline"
            >
              Переглянути
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Останні комплекти */}
      {recentSets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Останні комплекти</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSets.map((set) => (
                <div
                  key={set.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{set.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {set.object_name || 'Без обєкта'} •{' '}
                        {new Date(set.created_at).toLocaleDateString('uk-UA', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {set.racks?.reduce((sum, r) => sum + (r.quantity || 1), 0) || 0} од.
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {(set.total_cost_snapshot || set.total_cost || 0).toFixed(2)} ₴
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingSet(set)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Перегляд
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/my-sets')}
                className="w-full"
              >
                Показати всі комплекти
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mySets.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">У вас ще немає комплектів</h3>
              <p className="text-muted-foreground mb-4">
                Розпочніть з розрахунку стелажа та збережіть його як комплект
              </p>
              <Button onClick={() => navigate('/rack')}>
                <Calculator className="w-4 h-4 mr-2" />
                Розрахувати стелаж
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Діалог перегляду комплекту */}
      {viewingSet && (
        <Dialog open={!!viewingSet} onOpenChange={() => setViewingSet(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Комплект стелажів: {viewingSet.name}</DialogTitle>
              <DialogDescription>Детальна інформація про комплект</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Основна інформація */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Назва</Label>
                  <p className="text-sm font-medium">{viewingSet.name}</p>
                </div>
                <div>
                  <Label>Об'єкт</Label>
                  <p className="text-sm">{viewingSet.object_name || '—'}</p>
                </div>
              </div>

              {viewingSet.description && (
                <div>
                  <Label>Опис</Label>
                  <p className="text-sm">{viewingSet.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Кількість стелажів</Label>
                  <p className="text-sm">
                    {viewingSet.racks?.reduce((sum, r) => sum + (r.quantity || 1), 0) || 0} од.
                  </p>
                </div>
                <div>
                  <Label>Загальна вартість</Label>
                  <p className="text-lg font-bold text-primary">
                    {(viewingSet.total_cost_snapshot || viewingSet.total_cost || 0).toFixed(2)} ₴
                  </p>
                </div>
              </div>

              {/* Список стелажів */}
              {viewingSet.racks && viewingSet.racks.length > 0 && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                    Склад комплекту
                  </h4>

                  <div className="space-y-3">
                    {viewingSet.racks.map((rack, index) => (
                      <RackItemDisplay
                        key={rack.setId || rack.rackConfigId || index}
                        rack={rack}
                        showDetails={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setViewingSet(null)}>
                  Закрити
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardPage;
