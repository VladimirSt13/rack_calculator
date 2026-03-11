import { Package, Eye, Edit, Download, Loader2, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/Table';
import { IconButton } from '@/shared/components/IconButton';
import { RackSet } from '@/features/rack/types/rack.types';

interface RackSetsTableProps {
  rackSets: RackSet[];
  isLoading: boolean;
  filters: { search: string };
  onViewSet: (rackSet: RackSet) => void;
  onEditInCalculator?: (rackSet: RackSet) => void;
  onExport: (rackSet: RackSet) => void;
  onDelete?: (rackSet: RackSet) => void;
  isExporting?: boolean;
  emptyMessage?: string;
  mode?: 'user' | 'admin';
}

export const RackSetsTable: React.FC<RackSetsTableProps> = ({
  rackSets,
  isLoading,
  filters,
  onViewSet,
  onEditInCalculator,
  onExport,
  onDelete,
  isExporting = false,
  emptyMessage = 'У вас ще немає збережених комплектів',
  mode = 'user',
}) => {
  const filteredSets = rackSets.filter(
    (set) =>
      set.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      set.object_name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
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
            {filteredSets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {filters.search ? 'Комплекти не знайдено' : emptyMessage}
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
              filteredSets.map((rackSet) => (
                <TableRow key={rackSet.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      {rackSet.name}
                    </div>
                  </TableCell>
                  <TableCell>{rackSet.object_name || '—'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {mode === 'user'
                        ? rackSet.racks?.reduce((sum, r) => sum + (r.quantity || 1), 0) || 0
                        : rackSet.racks?.length || 0}{' '}
                      од.
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-lg">
                      {(mode === 'user'
                        ? rackSet.total_cost_snapshot || rackSet.total_cost || 0
                        : rackSet.total_cost || 0
                      ).toFixed(2)}{' '}
                      ₴
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(rackSet.created_at).toLocaleDateString('uk-UA', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <IconButton
                        icon={Eye}
                        variant="icon"
                        onClick={() => onViewSet(rackSet)}
                        aria-label="Переглянути"
                        title="Перегляд комплекту"
                      />
                      {mode === 'admin' && onEditInCalculator && (
                        <IconButton
                          icon={Edit}
                          variant="icon"
                          onClick={() => onEditInCalculator(rackSet)}
                          aria-label="Відкрити в редакторі"
                          title="Відкрити в калькуляторі"
                        />
                      )}
                      <IconButton
                        icon={Download}
                        variant="icon"
                        onClick={() => onExport(rackSet)}
                        aria-label="Експортувати"
                        disabled={isExporting}
                        title="Експортувати комплект"
                      />
                      {mode === 'user' && onDelete && (
                        <IconButton
                          icon={Trash2}
                          variant="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDelete(rackSet)}
                          aria-label="Видалити"
                          title="Видалити комплект"
                        />
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
  );
};

export default RackSetsTable;