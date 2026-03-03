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
    { value: 1, label: '1' },
    { value: 2, label: '2' },
  ];
  const floorsOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];
  const supportTypeOptions = [
    { value: 'straight', label: 'Пряма' },
    { value: 'step', label: 'Ступінчаста' },
  ];

  return (
    <CardContent>
      <FormSectionsGroup>
        {/* Dimensions Section */}
        <FormSection title='Розміри акумулятора'>
          <LengthWithGapField
            label='Довжина'
            id='battery-length'
            value={length}
            onChange={setLength}
            gapValue={gap}
            onGapChange={setGap}
            unit='мм'
            placeholder='0'
            required
          />

          <NumberField
            label='Ширина'
            id='battery-width'
            value={width}
            onChange={setWidth}
            unit='мм'
            placeholder='0'
            required
            inputWidth='9ch'
          />

          <NumberField
            label='Висота'
            id='battery-height'
            value={height}
            onChange={setHeight}
            unit='мм'
            placeholder='0'
            required
            inputWidth='9ch'
          />

          <NumberField
            label='Вага'
            id='battery-weight'
            value={weight}
            onChange={setWeight}
            unit='кг'
            placeholder='0'
            required
            inputWidth='9ch'
          />
        </FormSection>

        {/* Quantity Section */}
        <FormSection title='Кількість'>
          <NumberField
            label='Кількість'
            id='battery-count'
            value={count}
            onChange={setCount}
            unit='шт'
            min={1}
            placeholder='0'
            required
            inputWidth='9ch'
          />
        </FormSection>

        {/* Configuration Section */}
        <FormSection title='Конфігурація'>
          <FormSelectField
            label='Кількість рядів'
            id='battery-rows'
            value={rows}
            onChange={(val) => setRows(Number(val))}
            options={rowsOptions}
            required
            className='w-[9ch]'
          />

          <FormSelectField
            label='Кількість поверхів'
            id='battery-floors'
            value={floors}
            onChange={(val) => setFloors(Number(val))}
            options={floorsOptions}
            required
            className='w-[9ch]'
          />

          <FormSelectField
            label='Тип опори'
            id='battery-supportType'
            value={supportType}
            onChange={(val) => setSupportType(String(val))}
            options={supportTypeOptions}
            required
            className='w-[140px]'
          />
        </FormSection>
      </FormSectionsGroup>
    </CardContent>
  );
};

export default BatteryForm;
