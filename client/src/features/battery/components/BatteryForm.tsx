import React from 'react';
import { useBatteryFormStore } from '../formStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components';
import { FormField, FormLabel, Input, Select } from '../../../shared/components';

/**
 * Battery Form - форма введення параметрів акумулятора
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

  // Опції з конфігурації
  const rowsOptions = [1, 2];
  const floorsOptions = [1, 2, 3];
  const supportTypeOptions = [
    { value: 'straight', label: 'Пряма' },
    { value: 'step', label: 'Ступінчаста' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Параметри акумулятора</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="form space-y-5" noValidate>
          {/* Довжина + допуск */}
          <FormField>
            <FormLabel htmlFor="battery-length">
              <span>Довжина</span>
            </FormLabel>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                id="battery-length"
                name="length"
                placeholder="0"
                value={length}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLength(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-muted-foreground">+</span>
              <Input
                type="number"
                id="battery-gap"
                name="gap"
                placeholder="Δ"
                value={gap}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGap(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">мм</span>
            </div>
          </FormField>

          {/* Ширина */}
          <FormField>
            <FormLabel htmlFor="battery-width">
              <span>Ширина</span>
            </FormLabel>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                id="battery-width"
                name="width"
                placeholder="0"
                value={width}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWidth(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">мм</span>
            </div>
          </FormField>

          {/* Висота */}
          <FormField>
            <FormLabel htmlFor="battery-height">
              <span>Висота</span>
            </FormLabel>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                id="battery-height"
                name="height"
                placeholder="0"
                value={height}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeight(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">мм</span>
            </div>
          </FormField>

          {/* Вага */}
          <FormField>
            <FormLabel htmlFor="battery-weight">
              <span>Вага</span>
            </FormLabel>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                id="battery-weight"
                name="weight"
                placeholder="0"
                value={weight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">кг</span>
            </div>
          </FormField>

          {/* Кількість */}
          <FormField>
            <FormLabel htmlFor="battery-count">
              <span>Кількість</span>
            </FormLabel>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                id="battery-count"
                name="count"
                min={1}
                value={count}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCount(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">шт</span>
            </div>
          </FormField>

          {/* Кількість рядів */}
          <FormField>
            <FormLabel htmlFor="battery-rows">
              <span>Кількість рядів</span>
            </FormLabel>
            <Select
              id="battery-rows"
              name="rows"
              value={rows}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRows(Number(e.target.value))}
            >
              {rowsOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Кількість поверхів */}
          <FormField>
            <FormLabel htmlFor="battery-floors">
              <span>Кількість поверхів</span>
            </FormLabel>
            <Select
              id="battery-floors"
              name="floors"
              value={floors}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFloors(Number(e.target.value))}
            >
              {floorsOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Тип опори */}
          <FormField>
            <FormLabel htmlFor="battery-supportType">
              <span>Тип опори</span>
            </FormLabel>
            <Select
              id="battery-supportType"
              name="supportType"
              value={supportType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSupportType(e.target.value)}
            >
              {supportTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>
        </form>
      </CardContent>
    </Card>
  );
};

export default BatteryForm;
