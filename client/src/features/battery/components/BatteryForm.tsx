import React from 'react';
import { useBatteryFormStore } from '../formStore';
import {
  CardContent,
  FormSection,
  FormSectionsGroup,
  NumberField,
  LengthWithGapField,
  FormSelectField,
} from '../../../shared/components';

/**
 * Battery Form - форма введення параметрів акумулятора
 * Використовує компонентний підхід для зменшення бойлеркоду
 */
const BatteryForm: React.FC = () => {
  const {
    length,
    width,
    height,
    weight,
    gap,
    count,
    rows,
    floors,
    supportType,
    setLength,
    setWidth,
    setHeight,
    setWeight,
    setGap,
    setCount,
    setRows,
    setFloors,
    setSupportType,
  } = useBatteryFormStore();

  const rowsOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
  ];
  const floorsOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
  ];
  const supportTypeOptions = [
    { value: 'straight', label: 'Пряма' },
    { value: 'step', label: 'Ступінчаста' },
  ];

  return (
    <CardContent>
      <FormSectionsGroup className='max-w-full overflow-hidden'>
        {/* Dimensions Section */}
        <FormSection title='Розміри акумулятора, мм'>
          <LengthWithGapField
            label='Довжина'
            id='battery-length'
            value={length}
            onChange={setLength}
            gapValue={gap}
            onGapChange={setGap}
            placeholder='0'
            required
          />

          <NumberField
            label='Ширина'
            id='battery-width'
            value={width}
            onChange={setWidth}
            placeholder='0'
            required
            inputWidth='8ch'
          />

          <NumberField
            label='Висота'
            id='battery-height'
            value={height}
            onChange={setHeight}
            placeholder='0'
            required
            inputWidth='8ch'
          />

          <NumberField
            label='Вага'
            id='battery-weight'
            value={weight}
            onChange={setWeight}
            placeholder='0'
            required
            inputWidth='8ch'
          />
        </FormSection>

        {/* Quantity Section */}
        <FormSection title='Кількість, шт'>
          <NumberField
            label='Кількість'
            id='battery-count'
            value={count}
            onChange={setCount}
            min={1}
            placeholder='0'
            required
            inputWidth='8ch'
          />
        </FormSection>

        {/* Configuration Section */}
        <FormSection title='Конфігурація'>
          <FormSelectField
            label='Кількість рядів'
            id='battery-rows'
            value={String(rows)}
            onChange={(val) => setRows(Number(val))}
            options={rowsOptions}
            required
            className='w-[8ch]'
          />

          <FormSelectField
            label='Кількість поверхів'
            id='battery-floors'
            value={String(floors)}
            onChange={(val) => setFloors(Number(val))}
            options={floorsOptions}
            required
            className='w-[8ch]'
          />

          <FormSelectField
            label='Тип опори'
            id='battery-supportType'
            value={supportType}
            onChange={(val) => setSupportType(String(val))}
            options={supportTypeOptions}
            required
            className='w-[15ch]'
          />
        </FormSection>
      </FormSectionsGroup>
    </CardContent>
  );
};

export default BatteryForm;
