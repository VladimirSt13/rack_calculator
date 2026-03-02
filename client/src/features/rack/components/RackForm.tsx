import React, { useEffect } from 'react';
import { useRackFormStore } from '../formStore';
import { useRackSpansStore } from '../spansStore';
import { usePrice } from '../../../hooks/usePrice';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components';
import { FormField, FormLabel, Input, Select } from '../../../shared/components';
import SpanList from './SpanList';
import { Plus } from 'lucide-react';

/**
 * Rack Form - форма введення параметрів стелажа
 */
const RackForm: React.FC = () => {
  const {
    floors,
    verticalSupports,
    supports,
    rows,
    beamsPerRow,
    setFloors,
    setVerticalSupports,
    setSupports,
    setRows,
    setBeamsPerRow,
  } = useRackFormStore();

  const { addSpan } = useRackSpansStore();

  // Отримуємо опції з прайсу
  const { data: priceData } = usePrice();

  const supportsOptions = React.useMemo(() => {
    if (!priceData?.data?.supports) return [];
    return Object.keys(priceData.data.supports);
  }, [priceData]);

  const verticalSupportsOptions = React.useMemo(() => {
    if (!priceData?.data?.vertical_supports) return [];
    return Object.keys(priceData.data.vertical_supports);
  }, [priceData]);

  const spanOptions = React.useMemo(() => {
    if (!priceData?.data?.spans) return [];
    return Object.keys(priceData.data.spans);
  }, [priceData]);

  // Блокування verticalSupports якщо 1 поверх
  const isVerticalSupportsDisabled = floors === 1;

  useEffect(() => {
    if (isVerticalSupportsDisabled) {
      setVerticalSupports('');
    }
  }, [floors, isVerticalSupportsDisabled, setVerticalSupports]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Параметри</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="form space-y-5" noValidate>
          {/* Поверхи */}
          <FormField>
            <FormLabel htmlFor="rack-floors">
              <span>Кількість поверхів</span>
            </FormLabel>
            <Input
              type="number"
              id="rack-floors"
              name="floors"
              min={1}
              max={10}
              value={floors}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFloors(Number(e.target.value))}
            />
          </FormField>

          {/* Вертикальна опора */}
          <FormField>
            <FormLabel htmlFor="rack-verticalSupports">
              <span>Вертикальна опора</span>
            </FormLabel>
            <Select
              id="rack-verticalSupports"
              name="verticalSupports"
              value={verticalSupports}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVerticalSupports(e.target.value)}
              disabled={isVerticalSupportsDisabled}
            >
              <option value="">Виберіть...</option>
              {verticalSupportsOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Опора */}
          <FormField>
            <FormLabel htmlFor="rack-supports">
              <span>Опора</span>
            </FormLabel>
            <Select
              id="rack-supports"
              name="supports"
              value={supports}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSupports(e.target.value)}
            >
              <option value="">Виберіть...</option>
              {supportsOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Ряди */}
          <FormField>
            <FormLabel htmlFor="rack-rows">
              <span>Кількість рядів</span>
            </FormLabel>
            <Input
              type="number"
              id="rack-rows"
              name="rows"
              min={1}
              max={4}
              value={rows}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRows(Number(e.target.value))}
            />
          </FormField>

          {/* Балки */}
          <FormField>
            <FormLabel htmlFor="rack-beamsPerRow">
              <span>Балок в ряду</span>
            </FormLabel>
            <Input
              type="number"
              id="rack-beamsPerRow"
              name="beamsPerRow"
              min={2}
              max={4}
              value={beamsPerRow}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBeamsPerRow(Number(e.target.value))}
            />
          </FormField>

          {/* Прольоти */}
          <FormField>
            <div className="flex justify-between items-center mb-2">
              <FormLabel>Прольоти</FormLabel>
              <button
                type="button"
                className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent transition-fast"
                onClick={addSpan}
                aria-label="Додати проліт"
              >
                <Plus className="w-4 h-4 mr-1" />
                Додати
              </button>
            </div>
            <SpanList spanOptions={spanOptions} />
          </FormField>
        </form>
      </CardContent>
    </Card>
  );
};

export default RackForm;
