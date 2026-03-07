import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateBatteryRackName,
  type RackComponents,
  type PriceData,
} from './rackCalculator';

/**
 * Конфігурація стелажа для battery
 */
export interface BatteryRackConfig {
  floors: number;
  rows: number;
  supportType: string;
  length: number;
  width: number;
  height: number;
  spans: number[];
  beams: number;
}

/**
 * Результат розрахунку battery
 */
export interface BatteryCalculationResult {
  name: string;
  components: RackComponents;
  total: number | null; // Нульова ціна
  totalWithoutIsolators: number | null;
  zeroBase: number; // Завжди показуємо
}

/**
 * Розрахунок вартості стелажа для battery page
 */
export const calculateBatteryRack = (rackConfig: BatteryRackConfig, price: PriceData): BatteryCalculationResult | null => {
  const {
    floors,
    rows,
    supportType,
    length: rackLength,
    width: rackWidth,
    spans,
  } = rackConfig;

  // 1. Валідація
  if (!spans || spans.length === 0) {
    return null;
  }

  if (!price) {
    return null;
  }

  // 2. Конфігурація для спільного калькулятора
  const config = {
    floors,
    rows,
    beamsPerRow: 2,
    spansArray: spans,
    beams: rackConfig.beams || 2,
  };

  // 3. Розрахунок компонентів
  const components = calculateRackComponents(config, price);

  // 4. Генерація назви
  const name = generateBatteryRackName({
    floors,
    rows,
    supportType,
    rackWidth,
    rackLength,
    spans,
  });

  // 5. Підрахунок вартості (тільки нульова ціна для менеджерів)
  calculateTotalCost(components); // Рахуємо для перевірки
  calculateTotalWithoutIsolators(components);
  const zeroBase = 0; // Нульова ціна

  return {
    name,
    components,
    total: null, // Приховано для менеджерів
    totalWithoutIsolators: null, // Приховано для менеджерів
    zeroBase,
  };
};

export default calculateBatteryRack;
