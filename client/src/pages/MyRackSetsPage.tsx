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
import { DeleteDialog } from '@/shared/components/DeleteDialog';
import { Loader2, Package, Download, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { IconButton } from '@/shared/components/IconButton';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';

export const MyRackSetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<RackSet | null>(null);
  const [filters, setFilters] = useState({
    search: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['myRackSets'],
    queryFn: rackSetsApi.getAll,
  });

  // Мутація для експорту
  const exportMutation = useMutation({
    mutationFn: (id: number) => rackSetsApi.export(id),
    onSuccess: (data, id) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const rackSet = data?.rackSets?.find((s: any) => s.id === id);
      const fileName = rackSet?.name || `rack-set-${id}`;
      link.download = `${fileName}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Експорт виконано успішно');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Помилка експорту');
    },
  });

  const handleExport = (id: number) => {
    exportMutation.mutate(id);
  };

  // Відкрити комплект в редакторі
  const handleEditInCalculator = (rackSet: RackSet) => {
    localStorage.setItem('rackSetToEdit', JSON.stringify(rackSet));
    navigate('/rack', { state: { editSetId: rackSet.id } });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rackSetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRackSets'] });
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
                          icon={Edit}
                          variant="icon"
                          onClick={() => handleEditInCalculator(rackSet)}
                          aria-label="Редагувати"
                          title="Відкрити в калькуляторі"
                        />
                        <IconButton
                          icon={Download}
                          variant="icon"
                          onClick={() => handleExport(rackSet.id)}
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
    </div>
  );
};

export default MyRackSetsPage;
