import * as React from 'react';
import type { RackSetItem } from '@/features/rack/setStore';
import { useRackSetModal } from './useRackSetModal';
import { SetModalContent, type RenderSetContentProps } from '@/shared/components/SetModalContent';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/components/Table';

interface RackSetModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  racks: RackSetItem[];
}

export const RackSetModal: React.FC<RackSetModalProps> = ({
  isOpen = false,
  onClose = () => {},
  racks,
}) => {
  const {
    form,
    includePrices,
    setIncludePrices,
    isExporting,
    createMutation,
    onSubmit,
    handleExport,
    groupedRacks,
    totalCost,
  } = useRackSetModal({ isOpen, onClose, racks });

  // Кастомний рендер контенту для Rack (з таблицею компонентів)
  const renderSetContent = ({ groupedRacks, totalCost }: RenderSetContentProps<RackSetItem>) => (
    <div className="space-y-4">
      {groupedRacks.map((rack, index) => {
        const quantity = rack.quantity || 1;
        const zeroPrice = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero')?.value || 0;
        const totalZeroPrice = zeroPrice * quantity;

        return (
          <div key={rack.setId || index} className="border rounded-md bg-background p-3">
            <div className="mb-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {index + 1}
                </span>
                <p className="font-semibold text-base">{rack.name}</p>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Кількість: <span className="font-medium">{quantity}</span> од.
              </p>
            </div>

            {rack.components && Object.keys(rack.components).length > 0 && (
              <div className="mb-3 ml-8">
                <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
                  Комплектація:
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">№</TableHead>
                      <TableHead>Назва</TableHead>
                      <TableHead className="text-right">К-сть на 1 од</TableHead>
                      <TableHead className="text-right">Всього</TableHead>
                      <TableHead className="text-right">Ціна</TableHead>
                      <TableHead className="text-right">Сума</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(rack.components).flatMap(([category, items]) => {
                      if (Array.isArray(items)) {
                        return items.map(item => ({ category, ...item }));
                      } else if (items && typeof items === 'object') {
                        return [{ category, ...items }];
                      }
                      return [];
                    }).map((component, compIndex) => (
                      <TableRow key={`${component.category}-${compIndex}`}>
                        <TableCell className="text-sm text-muted-foreground">
                          {compIndex + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {component.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-mono">
                            {component.amount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-mono font-medium">
                            {component.amount * quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-mono">
                            {component.price.toFixed(2)} ₴
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-mono font-medium">
                            {(component.total * quantity).toFixed(2)} ₴
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="ml-8 space-y-2 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Нульова ціна:</span>
                <span className="font-medium tabular-nums">
                  {zeroPrice.toFixed(2)} ₴
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t">
                <span>Загальна нульова ціна позиції:</span>
                <span className="text-primary tabular-nums">
                  {totalZeroPrice.toFixed(2)} ₴
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <p className="text-lg font-semibold">Загальна нульова ціна комплекту:</p>
        <p className="text-2xl font-bold text-primary">
          {totalCost.toFixed(2)} ₴
        </p>
      </div>
    </div>
  );

  return (
    <SetModalContent<RackSetItem>
      isOpen={isOpen}
      onClose={onClose}
      form={form}
      includePrices={includePrices}
      setIncludePrices={setIncludePrices}
      isExporting={isExporting}
      isPending={createMutation.isPending}
      onSubmit={onSubmit}
      handleExport={handleExport}
      groupedRacks={groupedRacks}
      totalCost={totalCost}
      hasRacks={racks.length > 0}
      dialogTitle="Зберегти комплект стелажів"
      namePlaceholder="Наприклад: Стелажі для складу №1"
      objectNamePlaceholder="Наприклад: Склад готової продукції"
      renderSetContent={renderSetContent}
    />
  );
};

export default RackSetModal;
