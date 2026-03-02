import React from 'react';
import { useRackSetStore } from '../setStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../shared/components';
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
                  <input
                    type="number"
                    min={1}
                    value={rack.quantity}
                    onChange={(e) => updateRackQuantity(rack.setId, Number(e.target.value))}
                    className="w-16 p-1 text-center rounded-md border border-input bg-background text-sm"
                  />
                </TableCell>
                <TableCell>{rack.total.toFixed(2)} ₴</TableCell>
                <TableCell className="font-medium">
                  {(rack.total * rack.quantity).toFixed(2)} ₴
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => removeRack(rack.setId)}
                    className="inline-flex items-center justify-center p-1 rounded-md border-none bg-transparent text-destructive cursor-pointer transition-fast hover:bg-destructive/10"
                    aria-label="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 pt-4 border-t-2 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Загальна вартість:</span>
            <span className="text-lg font-semibold">{total.toFixed(2)} ₴</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Без ізоляторів:</span>
            <span className="font-medium">{totalWithoutIsolators.toFixed(2)} ₴</span>
          </div>
          <div className="flex justify-between text-2xl font-bold">
            <span>Нульова:</span>
            <span>{zeroBase.toFixed(2)} ₴</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <Eye className="w-4 h-4 mr-2" />
          Переглянути комплект
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RackSetCard;
