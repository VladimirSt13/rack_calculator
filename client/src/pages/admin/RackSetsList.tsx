import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rackSetsApi, RackSet, downloadRackSetExport } from '@/features/rack/rackSetsApi';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
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
import { Loader2, Eye, Trash2, Package, Download, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { IconButton } from '@/shared/components/IconButton';
import { Label } from '@/shared/components/Label';
import { Checkbox } from '@/shared/components/Checkbox';
import { useNavigate } from 'react-router-dom';
import { RackSetsTable } from '@/features/rack/components/RackSetsTable';

export const RackSetsList: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
    queryKey: ['rackSets'],
    queryFn: rackSetsApi.getAll,
  });

  // Мутація для експорту
  const exportMutation = useMutation({
    mutationFn: (variables: { id: number; includePrices: boolean; _rackSet: RackSet }) =>
      rackSetsApi.export(variables.id, variables.includePrices),
    onSuccess: (data, variables) => {
      downloadRackSetExport(data, variables._rackSet, variables.includePrices);
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
      exportMutation.mutate({
        id: rackSetToExport.id,
        includePrices,
        _rackSet: rackSetToExport,
      });
      setIsExportOpen(false);
      setRackSetToExport(null);
    }
  };

  // Відкрити комплект в редакторі
  const handleEditInCalculator = (rackSet: RackSet) => {
    // Зберігаємо комплект в localStorage для передачі в калькулятор
    localStorage.setItem('rackSetToEdit', JSON.stringify(rackSet));
    navigate('/rack', { state: { editSetId: rackSet.id } });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rackSetsApi.delete(id),
    onSuccess: () => {
      // Інвалідуємо обидва ключі: для адмінки та для "Мої комплекти"
      queryClient.invalidateQueries({ queryKey: ['rackSets'] });
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
    <div className='container mx-auto py-8 px-4'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Комплекти стелажів</h1>
          <p className='text-muted-foreground'>Збережені комплекти стелажів з розрахунками</p>
        </div>
      </div>

      {/* Фільтри */}
      <div className='bg-card rounded-lg border p-4 mb-6'>
        <div className='grid grid-cols-1 gap-4'>
          <Input
            placeholder="Пошук за назвою або об'єктом..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
      </div>

      {/* Таблиця комплектів */}
      <RackSetsTable
        rackSets={filteredSets || []}
        isLoading={isLoading}
        filters={filters}
        onViewSet={setViewingSet}
        onEditInCalculator={handleEditInCalculator}
        onExport={handleExport}
        onDelete={handleDelete}
        isExporting={exportMutation.isPending}
        emptyMessage="Немає збережених комплектів"
        mode="admin"
      />

      {/* Діалог перегляду */}
      {viewingSet && (
        <Dialog open onOpenChange={() => setViewingSet(null)}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Комплект стелажів: {viewingSet.name}</DialogTitle>
              <DialogDescription>Детальна інформація про комплект</DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {/* Основна інформація */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Назва</Label>
                  <p className='text-sm font-medium'>{viewingSet.name}</p>
                </div>
                <div>
                  <Label>Об'єкт</Label>
                  <p className='text-sm'>{viewingSet.object_name || '—'}</p>
                </div>
              </div>

              {viewingSet.description && (
                <div>
                  <Label>Опис</Label>
                  <p className='text-sm'>{viewingSet.description}</p>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Кількість стелажів</Label>
                  <p className='text-sm'>{viewingSet.racks?.reduce((sum, r) => sum + (r.quantity || 1), 0) || 0} од.</p>
                </div>
                <div>
                  <Label>Загальна вартість</Label>
                  <p className='text-lg font-bold text-primary'>{(viewingSet.total_cost || 0).toFixed(2)} ₴</p>
                </div>
              </div>

              {/* Список стелажів */}
              {viewingSet.racks && viewingSet.racks.length > 0 && (
                <div className='border rounded-lg p-4 bg-muted/30'>
                  <h4 className='font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground'>
                    Склад комплекту
                  </h4>

                  <div className='space-y-3'>
                    {viewingSet.racks.map((rack, index) => (
                      <RackItemDisplay key={rack.setId || rack.rackConfigId || index} rack={rack} showDetails={false} />
                    ))}
                  </div>
                </div>
              )}

              <div className='flex justify-end gap-2 pt-4'>
                <Button variant='outline' onClick={() => setViewingSet(null)}>
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
          title='Видалити комплект?'
          description={`Ви дійсно хочете видалити комплект "${setToDelete?.name}"? Цю дію не можна скасувати.`}
        />
      )}

      {/* Діалог експорту */}
      {isExportOpen && (
        <Dialog open onOpenChange={setIsExportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Експорт комплекту</DialogTitle>
              <DialogDescription>Оберіть опції експорту для "{rackSetToExport?.name}"</DialogDescription>
            </DialogHeader>
            <div className='py-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='includePrices'
                  checked={includePrices}
                  onCheckedChange={(checked) => setIncludePrices(checked as boolean)}
                />
                <Label htmlFor='includePrices' className='text-sm font-medium cursor-pointer'>
                  Додати ціни в експорт
                </Label>
              </div>
              <p className='text-xs text-muted-foreground mt-2'>
                Якщо відмітити, експорт буде містити стовпці з цінами на стелажі
              </p>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsExportOpen(false)}
                disabled={exportMutation.isPending}
              >
                Скасувати
              </Button>
              <Button type='button' onClick={handleConfirmExport} disabled={exportMutation.isPending}>
                {exportMutation.isPending ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Експорт...
                  </>
                ) : (
                  <>
                    <Download className='w-4 h-4 mr-2' />
                    Експортувати
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RackSetsList;
