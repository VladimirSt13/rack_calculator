import React from 'react';
import { useRackSetStore } from '../setStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, TextButton, IconButton, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input, PriceDisplay } from '../../../shared/components';
import { Trash2, Eye } from 'lucide-react';

/**
 * RackSetCard - картка комплекту стелажів
 */
const RackSetCard: React.FC = () => {
  const { racks, removeRack, updateRackQuantity } = useRackSetStore();

  const total = racks.reduce((sum, rack) => sum + rack.total * rack.quantity, 0);
  const totalWithoutIsolators = racks.reduce((sum, rack) => sum + rack.totalWithoutIsolators * rack.quantity, 0);
  const zeroBase = racks.reduce((sum, rack) => sum + rack.zeroBase * rack.quantity, 0);

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
                <TableHead>Вартість</TableHead>
                <TableHead>Загалом</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {racks.map((rack) => (
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
                    <PriceDisplay value={rack.total} />
                  </TableCell>
                  <TableCell className='font-medium'>
                    <PriceDisplay value={rack.total * rack.quantity} />
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Підсумок */}
        <div className="mt-4 pt-4 border-t-2 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Загальна вартість:</span>
            <PriceDisplay value={total} size='lg' className='font-semibold' />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Без ізоляторів:</span>
            <PriceDisplay value={totalWithoutIsolators} className='font-medium' />
          </div>
          <div className="flex justify-between text-2xl font-bold">
            <span>Нульова:</span>
            <PriceDisplay value={zeroBase} size='2xl' className='font-bold' />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <TextButton variant="outline" className="w-full" leftIcon={Eye}>
          Переглянути комплект
        </TextButton>
      </CardFooter>
    </Card>
  );
};

export default RackSetCard;
