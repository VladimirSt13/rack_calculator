import React, { useEffect } from 'react';
import { useRackFormStore } from '../formStore';
import { useRackSpansStore } from '../spansStore';
import { usePrice } from '@/hooks/usePrice';
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
import { Plus } from 'lucide-react';

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
  } = useRackFormStore();

  const { addSpan } = useRackSpansStore();
  const { data: priceData } = usePrice();

  // Опції з прайсу
  const supportsOptions = React.useMemo(
    () => (priceData?.data?.supports ? Object.keys(priceData.data.supports) : []),
    [priceData],
  );

  const verticalSupportsOptions = React.useMemo(
    () => (priceData?.data?.vertical_supports ? Object.keys(priceData.data.vertical_supports) : []),
    [priceData],
  );

  const spanOptions = React.useMemo(
    () => (priceData?.data?.spans ? Object.keys(priceData.data.spans) : []),
    [priceData],
  );

  // Блокування verticalSupports якщо 1 поверх
  const isVerticalSupportsDisabled = floors === 1;

  useEffect(() => {
    if (isVerticalSupportsDisabled) {
      setVerticalSupports('');
    }
  }, [floors, isVerticalSupportsDisabled, setVerticalSupports]);

  return (
    <CardContent className='w-full px-0'>
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
              {verticalSupportsOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
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
              {supportsOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
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
