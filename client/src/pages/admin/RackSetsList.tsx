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
} from '@/shared/components/Dialog';
import { DeleteDialog } from '@/shared/components/DeleteDialog';
import { Loader2, Eye, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { IconButton } from '@/shared/components/IconButton';
import { Label } from '@/shared/components/Label';

export const RackSetsList: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewingSet, setViewingSet] = useState<RackSet | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<RackSet | null>(null);
  const [filters, setFilters] = useState({
    search: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['rackSets'],
    queryFn: rackSetsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rackSetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rackSets'] });
      setIsDeleteOpen(false);
      toast.success('Комплект видалено');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Помилка видалення');
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

  const filteredSets = data?.rackSets.filter((set) => {
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
          <h1 className="text-3xl font-bold mb-2">Комплекти стелажів</h1>
          <p className="text-muted-foreground">
            Збережені комплекти стелажів з розрахунками
          </p>
        </div>
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
                          : 'Немає збережених комплектів'}
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
                        {rackSet.racks?.length || 0} од.
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-lg">
                        {(rackSet.total_cost || 0).toFixed(2)} ₴
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
                          onClick={() => setViewingSet(rackSet)}
                          aria-label="Переглянути"
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
                    {viewingSet.racks?.length || 0} од.
                  </p>
                </div>
                <div>
                  <Label>Загальна вартість</Label>
                  <p className="text-lg font-bold text-primary">
                    {(viewingSet.total_cost || 0).toFixed(2)} ₴
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
                      <div
                        key={rack.setId || index}
                        className="border rounded-md bg-background p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{rack.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Кількість:{' '}
                              <span className="font-medium">
                                {rack.quantity || 1} од.
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Вартість:
                            </p>
                            <p className="font-semibold">
                              {(
                                (rack.prices?.find((p: any) => 
                                  p.type === 'нульова' || p.type === 'zero'
                                )?.value || 0) * (rack.quantity || 1)
                              ).toFixed(2)} ₴
                            </p>
                          </div>
                        </div>

                        {/* Компоненти */}
                        {(rack as any).components && Object.keys((rack as any).components).length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
                              Комплектація:
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries((rack as any).components)
                                .flatMap(([_category, items]: [string, any]) => 
                                  Array.isArray(items) ? items.slice(0, 6).map((item: any) => ({ name: item.name, amount: item.amount })) : []
                                )
                                .slice(0, 6)
                                .map((comp: any, i: number) => (
                                  <div
                                    key={i}
                                    className="flex justify-between"
                                  >
                                    <span className="text-muted-foreground">
                                      {comp.name}:
                                    </span>
                                    <span className="font-medium">
                                      {comp.amount} од.
                                    </span>
                                  </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
    </div>
  );
};

export default RackSetsList;
