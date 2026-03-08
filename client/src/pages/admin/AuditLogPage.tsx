import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditApi } from '@/features/audit/auditApi';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/Table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/Dialog';
import { Loader2, FileText, User, Calendar, Activity, Trash2, TrendingUp, Database, Clock } from 'lucide-react';
import { toast } from 'sonner';

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Створення',
  UPDATE: 'Оновлення',
  DELETE: 'Видалення',
  LOGIN: 'Вхід',
  LOGOUT: 'Вихід',
  PASSWORD_CHANGE: 'Зміна пароля',
  PERMISSION_CHANGE: 'Зміна дозволів',
  PRICE_UPDATE: 'Оновлення прайсу',
  RACK_SET_CREATE: 'Створення комплекту',
  RACK_SET_UPDATE: 'Оновлення комплекту',
  RACK_SET_DELETE: 'Видалення комплекту',
};

const ENTITY_LABELS: Record<string, string> = {
  user: 'Користувач',
  price: 'Прайс',
  rack_set: 'Комплект стелажів',
  rack_set_revision: 'Ревізія комплекту',
  calculation: 'Розрахунок',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  PASSWORD_CHANGE: 'bg-yellow-100 text-yellow-800',
  PERMISSION_CHANGE: 'bg-indigo-100 text-indigo-800',
  PRICE_UPDATE: 'bg-orange-100 text-orange-800',
  RACK_SET_CREATE: 'bg-green-100 text-green-800',
  RACK_SET_UPDATE: 'bg-blue-100 text-blue-800',
  RACK_SET_DELETE: 'bg-red-100 text-red-800',
};

export const AuditLogPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    entityType: '',
    page: 1,
    limit: 50,
  });
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(90);

  const { data, isLoading } = useQuery({
    queryKey: ['audit', filters],
    queryFn: () =>
      auditApi.getAll({
        ...filters,
        page: filters.page,
        limit: filters.limit,
      }),
    staleTime: 1000 * 60, // 1 хвилина
  });

  const { data: statistics } = useQuery({
    queryKey: ['audit-statistics'],
    queryFn: () => auditApi.getStatistics(),
    staleTime: 1000 * 60 * 5, // 5 хвилин
  });

  const cleanupMutation = useMutation({
    mutationFn: (days: number) => auditApi.cleanup(days),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['audit'] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
      setIsCleanupOpen(false);
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Помилка очищення');
    },
  });

  const formatDateTime = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatJson = (jsonString?: string) => {
    if (!jsonString) return null;
    try {
      const obj = JSON.parse(jsonString);
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Журнал аудиту</h1>
          </div>
          <Button
            variant="destructive"
            onClick={() => setIsCleanupOpen(true)}
            disabled={cleanupMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Очистити старі
          </Button>
        </div>
        <p className="text-muted-foreground">
          Історія всіх дій у системі
        </p>
      </div>

      {/* Статистика */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Всього записів</p>
                <p className="text-2xl font-bold">{statistics.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">За 7 днів</p>
                <p className="text-2xl font-bold">{statistics.last7days.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">За 30 днів</p>
                <p className="text-2xl font-bold">{statistics.last30days.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Розмір БД</p>
                <p className="text-2xl font-bold">{formatBytes(statistics.databaseSize)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Фільтри */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Пошук..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
          />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filters.action}
            onChange={(e) =>
              setFilters({ ...filters, action: e.target.value, page: 1 })
            }
          >
            <option value="">Всі дії</option>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filters.entityType}
            onChange={(e) =>
              setFilters({ ...filters, entityType: e.target.value, page: 1 })
            }
          >
            <option value="">Всі сутності</option>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Таблиця аудиту */}
      <div className="bg-card rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Дія</TableHead>
                <TableHead>Сутність</TableHead>
                <TableHead>Користувач</TableHead>
                <TableHead>Дата та час</TableHead>
                <TableHead>Деталі</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Записів аудиту не знайдено
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      #{log.id}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {ENTITY_LABELS[log.entity_type] || log.entity_type}
                        </span>
                        {log.entity_id && (
                          <span className="text-xs text-muted-foreground font-mono">
                            #{log.entity_id}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{log.user_email || `ID: ${log.user_id}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="space-y-2">
                        {log.old_value && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-destructive font-medium">
                              Було
                            </summary>
                            <pre className="mt-1 p-2 bg-destructive/10 rounded text-destructive overflow-auto max-h-32">
                              {formatJson(log.old_value)}
                            </pre>
                          </details>
                        )}
                        {log.new_value && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-green-600 font-medium">
                              Стало
                            </summary>
                            <pre className="mt-1 p-2 bg-green-100 rounded text-green-800 overflow-auto max-h-32">
                              {formatJson(log.new_value)}
                            </pre>
                          </details>
                        )}
                        {!log.old_value && !log.new_value && (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Пагінація */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className="px-4 py-2 rounded-md border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            onClick={() =>
              setFilters({ ...filters, page: filters.page - 1 })
            }
            disabled={filters.page === 1}
          >
            Попередня
          </button>
          <span className="text-sm text-muted-foreground">
            Сторінка {filters.page} з {data.pagination.totalPages}
          </span>
          <button
            className="px-4 py-2 rounded-md border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            onClick={() =>
              setFilters({ ...filters, page: filters.page + 1 })
            }
            disabled={filters.page === data.pagination.totalPages}
          >
            Наступна
          </button>
        </div>
      )}

      {/* Статистика */}
      {data && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Всього записів: <span className="font-medium">{data.pagination.total}</span>
        </div>
      )}

      {/* Діалог очищення */}
      <Dialog open={isCleanupOpen} onOpenChange={setIsCleanupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Очищення журналу аудиту</DialogTitle>
            <DialogDescription>
              Видалити всі записи аудиту старіше вказаного періоду. Цю дію не можна скасувати.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Зберегти записи за останні (днів):
              </label>
              <Input
                type="number"
                min="1"
                max="365"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(parseInt(e.target.value) || 90)}
              />
              <p className="text-xs text-muted-foreground">
                Рекомендовано: 30-90 днів. Записи старіше цього періоду будуть видалені назавжди.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCleanupOpen(false)}
              disabled={cleanupMutation.isPending}
            >
              Скасувати
            </Button>
            <Button
              variant="destructive"
              onClick={() => cleanupMutation.mutate(cleanupDays)}
              disabled={cleanupMutation.isPending}
            >
              {cleanupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Видалення...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Видалити старі записи
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogPage;
