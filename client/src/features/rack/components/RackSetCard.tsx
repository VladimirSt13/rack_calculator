import React, { useState } from 'react';
import { useRackSetStore, type RackSetItem, type PriceInfo } from '@/features/rack/setStore';
import { RackSetModal } from '@/features/rack/RackSetModal';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, TextButton, IconButton, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input, PriceDisplay } from '@/shared/components';
import { Trash2, Eye } from 'lucide-react';

/**
 * RackSetCard - картка комплекту стелажів
 */
const RackSetCard: React.FC = () => {
  const { racks, removeRack, updateRackQuantity } = useRackSetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Функція для отримання нульової ціни з prices масиву
  const getZeroPrice = (rack: RackSetItem) => {
    const priceItem = rack.prices?.find((p: PriceInfo) => p.type === 'нульова' || p.type === 'zero');
    return priceItem?.value || 0;
  };

  // Функція для отримання ціни "без ізоляторів" з prices масиву
  const getPriceWithoutIsolators = (rack: RackSetItem) => {
    const priceItem = rack.prices?.find((p: PriceInfo) => p.type === 'без_ізоляторів' || p.type === 'no_isolators');
    return priceItem?.value || 0;
  };

  // Перевіряємо чи є хоча б одна нульова ціна в комплектах
  const hasZeroPrice = racks.some((rack: RackSetItem) =>
    rack.prices?.some((p: PriceInfo) => p.type === 'нульова' || p.type === 'zero')
  );

  const totalZero = racks.reduce((sum, rack) => {
    const rackPrice = getZeroPrice(rack);
    return sum + (rackPrice * (rack.quantity || 1));
  }, 0);

  const totalWithoutIsolators = racks.reduce((sum, rack) => {
    const rackPrice = getPriceWithoutIsolators(rack);
    return sum + (rackPrice * (rack.quantity || 1));
  }, 0);

  if (racks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Комплект стелажів</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Додайте стелажі до комплекту
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Комплект стелажів</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="max-w-[200px]">Назва</TableHead>
                  <TableHead>Кількість</TableHead>
                  <TableHead>Вартість ({hasZeroPrice ? 'нульова' : 'без ізол.'})</TableHead>
                  <TableHead>Загалом</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {racks.map((rack) => {
                  // Використовуємо нульову ціну якщо вона є, інакше без ізоляторів
                  const rackPrice = hasZeroPrice ? getZeroPrice(rack) : getPriceWithoutIsolators(rack);
                  const quantity = rack.quantity || 1;
                  const lineTotal = rackPrice * quantity;
                  
                  return (
                    <TableRow key={rack.setId}>
                      <TableCell className="max-w-[200px]">
                        <div className="text-sm font-medium">{rack.name}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={rack.quantity}
                          onChange={(e) => updateRackQuantity(rack.setId, Number(e.target.value))}
                          className="w-16 text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <PriceDisplay value={rackPrice} />
                      </TableCell>
                      <TableCell className='font-medium'>
                        <PriceDisplay value={lineTotal} />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          icon={Trash2}
                          variant='icon'
                          onClick={() => removeRack(rack.setId)}
                          aria-label="Видалити"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Підсумок */}
          <div className="mt-4 pt-4 border-t-2 space-y-2">
            {/* Показуємо основну ціну (нульова або без ізоляторів) */}
            {hasZeroPrice ? (
              <div className="flex justify-between text-2xl font-bold">
                <span>Нульова:</span>
                <PriceDisplay value={totalZero} size='2xl' className='font-bold text-primary' />
              </div>
            ) : (
              <div className="flex justify-between text-2xl font-bold">
                <span>Без ізоляторів:</span>
                <PriceDisplay value={totalWithoutIsolators} size='2xl' className='font-bold text-primary' />
              </div>
            )}
            {/* Показуємо без ізоляторів тільки якщо є дозвіл на нульову */}
            {hasZeroPrice && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Без ізоляторів:</span>
                <PriceDisplay value={totalWithoutIsolators} className='font-medium' />
              </div>
            )}
          </div>

          <CardFooter className="px-0 pb-0">
            <TextButton 
              variant="outline" 
              className="w-full" 
              leftIcon={Eye}
              onClick={() => setIsModalOpen(true)}
            >
              Переглянути комплект
            </TextButton>
          </CardFooter>
        </CardContent>
      </Card>

      <RackSetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        racks={racks}
      />
    </>
  );
};

export default RackSetCard;
