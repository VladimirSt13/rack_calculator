import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/Alert';
import { CATEGORY_NAMES } from '@/core/constants/priceCategories';

export interface PricePreviewProps {
  data: Record<string, any>;
  onConfirm: () => void;
  onCancel: () => void;
  isUploading: boolean;
}

/**
 * PricePreview - компонент для попереднього перегляду прайсу
 */
export const PricePreview: React.FC<PricePreviewProps> = ({ data, onConfirm, onCancel, isUploading }) => {
  // Логування для відладки
  console.log('[PricePreview] Data keys:', Object.keys(data));
  console.log('[PricePreview] Supports:', data.supports);
  console.log('[PricePreview] Vertical supports:', data.vertical_supports);

  // Підрахунок кількості позицій по категоріях
  const categoryCounts = {
    supports: Object.keys(data.supports || {}).length,
    spans: Object.keys(data.spans || {}).length,
    vertical_supports: Object.keys(data.vertical_supports || {}).length,
    diagonal_brace: Object.keys(data.diagonal_brace || {}).length,
    isolator: Object.keys(data.isolator || {}).length,
  };

  const totalItems = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <AlertTriangle className='w-5 h-5 text-yellow-600' />
          Попередній перегляд прайсу
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Помилки парсингу */}
        {data.errors && data.errors.length > 0 && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Помилки в файлі</AlertTitle>
            <AlertDescription>
              <ul className='list-disc list-inside space-y-1 mt-2'>
                {data.errors.slice(0, 5).map((error: any, index: number) => (
                  <li key={index} className='text-sm'>
                    Рядок {error.row}: {error.message}
                  </li>
                ))}
              </ul>
              {data.errors.length > 5 && <p className='text-sm mt-2'>Ще {data.errors.length - 5} помилок...</p>}
            </AlertDescription>
          </Alert>
        )}

        {/* Статистика по категоріях */}
        <div>
          <h3 className='font-semibold mb-3'>Кількість позицій:</h3>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className='p-3 bg-muted rounded-lg text-center'>
                <p className='text-2xl font-bold text-primary'>{count}</p>
                <p className='text-xs text-muted-foreground mt-1'>{CATEGORY_NAMES[category]}</p>
              </div>
            ))}
          </div>
          <div className='mt-4 p-3 bg-primary/10 rounded-lg text-center'>
            <p className='text-lg font-semibold text-primary'>Всього: {totalItems} позицій</p>
          </div>
        </div>

        {/* Деталізація по категоріях - повна таблиця */}
        <div className='space-y-6'>
          {Object.entries(data)
            .filter(([key]) => key !== 'errors')
            .map(([category, items]) => {
              // Конвертуємо об'єкт в масив для відображення
              const categoryData = Object.entries(items || {}).map(([code, item]: [string, any]) => ({
                code,
                ...item,
              }));

              if (categoryData.length === 0) return null;

              // Для опор (supports) - окреме відображення з вкладеними edge/intermediate
              if (category === 'supports') {
                // Проходимо по вхідних даних (це об'єкт, а не масив)
                const supportEntries = Object.entries(items || {});

                return (
                  <div key={category} className='border rounded-lg overflow-hidden'>
                    <div className='bg-muted px-4 py-2 border-b'>
                      <h4 className='font-semibold text-sm'>
                        {CATEGORY_NAMES[category]} ({supportEntries.length})
                      </h4>
                    </div>
                    <div className='overflow-x-auto'>
                      <table className='w-full text-sm'>
                        <thead className='bg-muted/50'>
                          <tr>
                            <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Код</th>
                            <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Назва</th>
                            <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Тип</th>
                            <th className='px-4 py-2 text-right font-medium text-xs text-muted-foreground'>
                              Ціна, грн
                            </th>
                            <th className='px-4 py-2 text-right font-medium text-xs text-muted-foreground'>Вага, кг</th>
                            <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Опис</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y'>
                          {supportEntries.map(([code, item]: [string, any]) => {
                            const rows = [];

                            // Крайня опора
                            if (item.edge) {
                              rows.push(
                                <tr key={`${code}-edge`} className='hover:bg-muted/30'>
                                  <td className='px-4 py-2 font-mono text-xs'>{code}</td>
                                  <td className='px-4 py-2 font-semibold'>{item.name || code}</td>
                                  <td className='px-4 py-2'>
                                    <span className='px-2 py-1 rounded text-xs bg-blue-100 text-blue-800'>Крайня</span>
                                  </td>
                                  <td className='px-4 py-2 text-right'>
                                    {typeof item.edge.price === 'number' ? item.edge.price.toFixed(2) : '—'}
                                  </td>
                                  <td className='px-4 py-2 text-right text-muted-foreground'>
                                    {item.edge.weight ? item.edge.weight.toFixed(2) : '—'}
                                  </td>
                                  <td className='px-4 py-2 text-muted-foreground text-xs max-w-xs truncate'>
                                    {item.edge.description || item.description || '—'}
                                  </td>
                                </tr>,
                              );
                            }

                            // Проміжна опора
                            if (item.intermediate) {
                              rows.push(
                                <tr key={`${code}-intermediate`} className='hover:bg-muted/30'>
                                  <td className='px-4 py-2 font-mono text-xs'>{code}</td>
                                  <td className='px-4 py-2 font-semibold'>{item.name || code}</td>
                                  <td className='px-4 py-2'>
                                    <span className='px-2 py-1 rounded text-xs bg-green-100 text-green-800'>
                                      Проміжна
                                    </span>
                                  </td>
                                  <td className='px-4 py-2 text-right'>
                                    {typeof item.intermediate.price === 'number'
                                      ? item.intermediate.price.toFixed(2)
                                      : '—'}
                                  </td>
                                  <td className='px-4 py-2 text-right text-muted-foreground'>
                                    {item.intermediate.weight ? item.intermediate.weight.toFixed(2) : '—'}
                                  </td>
                                  <td className='px-4 py-2 text-muted-foreground text-xs max-w-xs truncate'>
                                    {item.intermediate.description || item.description || '—'}
                                  </td>
                                </tr>,
                              );
                            }

                            return rows;
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              // Для вертикальних опор (vertical_supports) - окреме відображення
              if (category === 'vertical_supports') {
                return (
                  <div key={category} className='border rounded-lg overflow-hidden'>
                    <div className='bg-muted px-4 py-2 border-b'>
                      <h4 className='font-semibold text-sm'>
                        {CATEGORY_NAMES[category]} ({categoryData.length})
                      </h4>
                    </div>
                    <div className='overflow-x-auto'>
                      <table className='w-full text-sm'>
                        <thead className='bg-muted/50'>
                          <tr>
                            <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Код</th>
                            <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Назва</th>
                            <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Артикул</th>
                            <th className='px-4 py-2 text-right font-medium text-xs text-muted-foreground'>
                              Ціна, грн
                            </th>
                            <th className='px-4 py-2 text-right font-medium text-xs text-muted-foreground'>Вага, кг</th>
                            <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Опис</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y'>
                          {categoryData.map((item: any, index: number) => (
                            <tr key={index} className='hover:bg-muted/30'>
                              <td className='px-4 py-2 font-mono text-xs'>{item.code}</td>
                              <td className='px-4 py-2'>{item.name}</td>
                              <td className='px-4 py-2 text-muted-foreground'>{item.sku || '—'}</td>
                              <td className='px-4 py-2 text-right'>
                                {typeof item.price === 'number' ? item.price.toFixed(2) : '—'}
                              </td>
                              <td className='px-4 py-2 text-right text-muted-foreground'>
                                {item.weight ? item.weight.toFixed(2) : '—'}
                              </td>
                              <td className='px-4 py-2 text-muted-foreground text-xs max-w-xs truncate'>
                                {item.description || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              // Для інших категорій (spans, diagonal_brace, isolator)
              return (
                <div key={category} className='border rounded-lg overflow-hidden'>
                  <div className='bg-muted px-4 py-2 border-b'>
                    <h4 className='font-semibold text-sm'>
                      {CATEGORY_NAMES[category]} ({categoryData.length})
                    </h4>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead className='bg-muted/50'>
                        <tr>
                          <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Код</th>
                          <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Назва</th>
                          <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Артикул</th>
                          <th className='px-4 py-2 text-right font-medium text-xs text-muted-foreground'>Ціна, грн</th>
                          <th className='px-4 py-2 text-right font-medium text-xs text-muted-foreground'>Вага, кг</th>
                          <th className='px-4 py-2 text-left font-medium text-xs text-muted-foreground'>Опис</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y'>
                        {categoryData.map((item: any, index: number) => (
                          <tr key={index} className='hover:bg-muted/30'>
                            <td className='px-4 py-2 font-mono text-xs'>{item.code}</td>
                            <td className='px-4 py-2'>{item.name}</td>
                            <td className='px-4 py-2 text-muted-foreground'>{item.sku || '—'}</td>
                            <td className='px-4 py-2 text-right'>
                              {typeof item.price === 'number' ? item.price.toFixed(2) : '—'}
                            </td>
                            <td className='px-4 py-2 text-right text-muted-foreground'>
                              {item.weight ? item.weight.toFixed(2) : '—'}
                            </td>
                            <td className='px-4 py-2 text-muted-foreground text-xs max-w-xs truncate'>
                              {item.description || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
      <CardFooter className='gap-2'>
        <Button variant='outline' onClick={onCancel} disabled={isUploading}>
          <X className='w-4 h-4 mr-2' />
          Скасувати
        </Button>
        <Button onClick={onConfirm} disabled={isUploading}>
          <Check className='w-4 h-4 mr-2' />
          {isUploading ? 'Завантаження...' : 'Підтвердити та зберегти'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricePreview;
