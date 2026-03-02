import React from 'react';
import { useRackResultsStore } from '../resultsStore';
import { useRackSetStore } from '../setStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../shared/components';
import { Plus } from 'lucide-react';

/**
 * Rack Results - відображення результатів розрахунку
 */
const RackResults: React.FC = () => {
  const { result } = useRackResultsStore();
  const { addRack } = useRackSetStore();

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Стелаж</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Заповніть форму та натисніть "Розрахувати"
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleAddToSet = () => {
    addRack(result, 1);
  };

  // Рендеринг таблиці компонентів
  const renderComponentsTable = () => {
    if (!result.components) {
      return null;
    }

    const rows: React.ReactNode[] = [];

    Object.values(result.components).forEach((items) => {
      const itemsArray = Array.isArray(items) ? items : [items];
      itemsArray.forEach((item) => {
        rows.push(
          <TableRow key={item.name}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-center">{item.amount}</TableCell>
            <TableCell className="text-right">{item.price.toFixed(2)} ₴</TableCell>
            <TableCell className="text-center font-medium">{item.total.toFixed(2)} ₴</TableCell>
          </TableRow>
        );
      });
    });

    return (
      <div className="table-wrapper rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary">
              <TableHead>Компонент</TableHead>
              <TableHead className="text-center">Кількість</TableHead>
              <TableHead className="text-right">Ціна за од.</TableHead>
              <TableHead className="text-center">Загальна вартість</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{rows}</TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Стелаж</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="result-block space-y-2">
          <span className="block text-sm text-muted-foreground">
            Назва
          </span>
          <output className="text-2xl font-semibold">
            {result.name}
          </output>
        </div>

        <div className="result-block space-y-2">
          <span className="block text-sm text-muted-foreground">
            Компоненти
          </span>
          {renderComponentsTable()}
        </div>

        <div className="pricing space-y-2">
          <h4 className="text-base font-semibold">Вартість</h4>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Загальна</span>
              <span className="font-medium">{result.total.toFixed(2)} ₴</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Без ізоляторів</span>
              <span className="font-medium">{result.totalWithoutIsolators.toFixed(2)} ₴</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 text-2xl font-bold">
              <span>Нульова</span>
              <span>{result.zeroBase.toFixed(2)} ₴</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAddToSet} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Додати до комплекту
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RackResults;
