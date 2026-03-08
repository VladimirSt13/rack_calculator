import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rackSetsApi, RackSet } from '@/features/rack/rackSetsApi';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
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
import { DeleteDialog } from '@/shared/components/DeleteDialog';
import { RackItemDisplay } from '@/shared/components/RackItemDisplay';
import { Loader2, Package, Download, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { IconButton } from '@/shared/components/IconButton';
import { Label } from '@/shared/components/Label';
import { Checkbox } from '@/shared/components/Checkbox';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';

export const MyRackSetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [viewingSet, setViewingSet] = useState<RackSet | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<RackSet | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [rackSetToExport, setRackSetToExport] = useState<RackSet | null>(null);
  const [includePrices, setIncludePrices] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['myRackSets'],
    queryFn: rackSetsApi.getAll,
  });

  // Мутація для експорту
  const exportMutation = useMutation({
    mutationFn: ({ id, includePrices }: { id: number; includePrices: boolean }) => rackSetsApi.export(id, includePrices),
    onSuccess: (data, variables) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const fileName = variables.includePrices
        ? `${rackSetToExport?.name}_з_цінами.xlsx`
        : `${rackSetToExport?.name}.xlsx`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Експорт виконано успішно');
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.error || 'Помилка експорту');
    },
  });

  const handleExport = (rackSet: RackSet) => {
    setRackSetToExport(rackSet);
    setIncludePrices(false);
    setIsExportOpen(true);
  };

  const handleConfirmExport = () => {
    if (rackSetToExport) {
      exportMutation.mutate({ id: rackSetToExport.id, includePrices });
      setIsExportOpen(false);
      setRackSetToExport(null);
    }
  };

  // Відкрити перегляд комплекту
  const handleViewSet = (rackSet: RackSet) => {
    setViewingSet(rackSet);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rackSetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRackSets'] });
      setIsDeleteOpen(false);
      toast.success('Комплект видалено');
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.error || 'Помилка видалення');
    },
  });

  const handleDelete = (rackSet: RackSet) => {
    setSetToDelete(rackSet);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (setToDelete) {
      deleteMutation.mutate(setToDelete.id);
    }
  };

  // Фільтруємо тільки свої комплекти
  const mySets = data?.rackSets.filter((set) => set.user_id === user?.id);
  const filteredSets = mySets?.filter((set) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      set.name.toLowerCase().includes(searchLower) ||
      (set.object_name && set.object_name.toLowerCase().includes(searchLower)) ||
      (set.description && set.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Мої комплекти</h1>
          <p className="text-muted-foreground">
            Ваші збережені комплекти стелажів
          </p>
        </div>
        <Button onClick={() => navigate('/rack')}>
          <Package className="w-4 h-4 mr-2" />
          Створити новий
        </Button>
      </div>

      {/* Фільтри */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 gap-4">
          <Input
            placeholder="Пошук за назвою або об'єктом..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
      </div>

      {/* Таблиця комплектів */}
      <div className="bg-card rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Об'єкт</TableHead>
                <TableHead>Кількість стелажів</TableHead>
                <TableHead>Загальна вартість</TableHead>
                <TableHead>Створено</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSets?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {filters.search
                          ? 'Комплекти не знайдено'
                          : 'У вас ще немає збережених комплектів'}
                      </p>
                      {!filters.search && (
                        <p className="text-sm text-muted-foreground">
                          Розрахуйте стелажі та збережіть їх як комплект
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSets?.map((rackSet) => (
                  <TableRow key={rackSet.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        {rackSet.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rackSet.object_name || '—'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rackSet.racks?.reduce((sum, r) => sum + (r.quantity || 1), 0) || 0} од.
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-lg">
                        {(rackSet.total_cost_snapshot || rackSet.total_cost || 0).toFixed(2)} ₴
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(rackSet.created_at).toLocaleDateString('uk-UA', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <IconButton
                          icon={Eye}
                          variant="icon"
                          onClick={() => handleViewSet(rackSet)}
                          aria-label="Переглянути"
                          title="Перегляд комплекту"
                        />
                        <IconButton
                          icon={Download}
                          variant="icon"
                          onClick={() => handleExport(rackSet)}
                          aria-label="Експортувати"
                          disabled={exportMutation.isPending}
                        />
                        <IconButton
                          icon={Trash2}
                          variant="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(rackSet)}
                          aria-label="Видалити"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Діалог видалення */}
      {isDeleteOpen && (
        <DeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={confirmDelete}
          title="Видалити комплект?"
          description={`Ви дійсно хочете видалити комплект "${setToDelete?.name}"? Цю дію не можна скасувати.`}
        />
      )}

      {/* Діалог експорту */}
      {isExportOpen && (
        <Dialog open onOpenChange={setIsExportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Експорт комплекту</DialogTitle>
              <DialogDescription>
                Оберіть опції експорту для "{rackSetToExport?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePrices"
                  checked={includePrices}
                  onCheckedChange={(checked) => setIncludePrices(checked as boolean)}
                />
                <Label htmlFor="includePrices" className="text-sm font-medium cursor-pointer">
                  Додати ціни в експорт
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Якщо відмітити, експорт буде містити стовпці з цінами на стелажі
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExportOpen(false)}
                disabled={exportMutation.isPending}
              >
                Скасувати
              </Button>
              <Button
                type="button"
                onClick={handleConfirmExport}
                disabled={exportMutation.isPending}
              >
                {exportMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Експорт...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Експортувати
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Діалог перегляду */}
      {viewingSet && (
        <Dialog open onOpenChange={() => setViewingSet(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Комплект стелажів: {viewingSet.name}</DialogTitle>
              <DialogDescription>
                Детальна інформація про комплект
              </DialogDescription>
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
                      <RackItemDisplay key={rack.setId || rack.rackConfigId || index} rack={rack} showDetails={false} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewingSet(null)}
                >
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

export default MyRackSetsPage;
