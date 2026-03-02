import React from 'react';
import { useBatteryResultsStore } from '../resultsStore';
import { useBatterySetStore } from '../setStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../shared/components';
import { Plus } from 'lucide-react';

/**
 * Battery Results - відображення результатів підбору
 */
const BatteryResults: React.FC = () => {
  const { variants } = useBatteryResultsStore();
  const { addRack } = useBatterySetStore();

  if (!variants || variants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Варіанти стелажів</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Заповніть форму та натисніть "Підібрати"
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Варіанти стелажів</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Прольоти</TableHead>
              <TableHead>Балок</TableHead>
              <TableHead>Вартість</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, index) => (
              <TableRow key={index}>
                <TableCell className="max-w-[200px]">
                  <div>
                    <div className="text-sm font-medium">{variant.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {variant.width} × {variant.height} мм
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {variant.combination.join('+')} мм
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{variant.beams} шт</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{variant.total.toFixed(2)} ₴</div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addRack(variant, 1)}
                    className="w-10 h-10 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BatteryResults;
