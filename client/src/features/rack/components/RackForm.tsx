import React, { useEffect } from 'react';
import { useRackFormStore } from '@/features/rack/formStore';
import { useRackSpansStore } from '@/features/rack/spansStore';
import { useRackResultsStore } from '@/features/rack/resultsStore';
import { useRackComponents } from '@/features/rack/useRackComponents';
import type { SupportComponent, VerticalSupportComponent, SpanComponent } from '@/features/rack/types/rack.types';
import type { ComponentOption } from '@/features/rack/types/rack.types';
import {
  CardContent,
  FieldRow,
  FieldRowInput,
  FieldRowSelect,
  FormSection,
  FormSectionsGroup,
  IconButton,
} from '@/shared/components';
import SpanList from './SpanList';
import { Plus, X } from 'lucide-react';

/**
 * Rack Form - форма введення параметрів стелажа
 * Використовує компонентний підхід для зменшення бойлеркоду
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
    reset,
  } = useRackFormStore();

  const { addSpan, reset: resetSpans } = useRackSpansStore();
  const resultsStore = useRackResultsStore();

  const handleReset = () => {
    reset();
    resetSpans();
    resultsStore.clear();
  };

  const {
    supports: supportsComponents,
    verticalSupports: verticalSupportsComponents,
    spans: spansComponents,
    isLoading,
  } = useRackComponents();

  // Трансформація компонентів у формат для селекту
  const supportsOptions = React.useMemo(
    () => supportsComponents.map((s: SupportComponent) => ({ value: s.code, label: s.name })),
    [supportsComponents],
  );

  const verticalSupportsOptions = React.useMemo(
    () => verticalSupportsComponents.map((s: VerticalSupportComponent) => ({ value: s.code, label: s.name })),
    [verticalSupportsComponents],
  );

  const spanOptions = React.useMemo(
    () => spansComponents.map((s: SpanComponent) => ({ value: s.code, label: s.name || s.code })),
    [spansComponents],
  );

  // Блокування verticalSupports якщо 1 поверх
  const isVerticalSupportsDisabled = floors === 1;

  useEffect(() => {
    if (isVerticalSupportsDisabled) {
      setVerticalSupports('');
    }
  }, [floors, isVerticalSupportsDisabled, setVerticalSupports]);

  // Показуємо лоадер поки дані завантажуються
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        <span className='ml-2 text-sm text-muted-foreground'>Завантаження комплектуючих...</span>
      </div>
    );
  }

  return (
    <CardContent className='w-full px-0'>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Параметри стелажа</h3>
        <button
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          title="Очистити форму"
        >
          <X className="w-3 h-3" />
          Очистити
        </button>
      </div>

      <FormSectionsGroup>
        {/* Geometry Section */}
        <FormSection title='Геометрія'>
          <FieldRow label='Кількість поверхів' htmlFor='rack-floors' required>
            <FieldRowInput
              id='rack-floors'
              type='number'
              min={1}
              max={10}
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
              charWidth={9}
            />
          </FieldRow>

          <FieldRow label='Вертикальна опора' htmlFor='rack-verticalSupports' required={floors > 1}>
            <FieldRowSelect
              id='rack-verticalSupports'
              value={verticalSupports}
              onChange={(e) => setVerticalSupports(e.target.value)}
              disabled={isVerticalSupportsDisabled}
              placeholder='Виберіть...'
            >
              {verticalSupportsOptions.map((opt: ComponentOption) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </FieldRowSelect>
          </FieldRow>

          <FieldRow label='Опора' htmlFor='rack-supports' required>
            <FieldRowSelect
              id='rack-supports'
              value={supports}
              onChange={(e) => setSupports(e.target.value)}
              placeholder='Виберіть...'
            >
              {supportsOptions.map((opt: ComponentOption) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </FieldRowSelect>
          </FieldRow>

          <FieldRow label='Кількість рядів' htmlFor='rack-rows' required>
            <FieldRowInput
              id='rack-rows'
              type='number'
              min={1}
              max={4}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              charWidth={9}
            />
          </FieldRow>

          <FieldRow label='Балок в ряду' htmlFor='rack-beamsPerRow' required>
            <FieldRowInput
              id='rack-beamsPerRow'
              type='number'
              min={2}
              max={4}
              value={beamsPerRow}
              onChange={(e) => setBeamsPerRow(Number(e.target.value))}
              charWidth={9}
            />
          </FieldRow>
        </FormSection>

        {/* Spans Section */}
        <FormSection title='Прольоти'>
          <div className='flex items-center gap-2 mb-2'>
            <IconButton icon={Plus} variant='iconOutline' onClick={addSpan} aria-label='Додати проліт' />
            <span className='text-sm text-muted-foreground'>Додати проліт</span>
          </div>
          <SpanList spanOptions={spanOptions} />
        </FormSection>
      </FormSectionsGroup>
    </CardContent>
  );
};

export default RackForm;
