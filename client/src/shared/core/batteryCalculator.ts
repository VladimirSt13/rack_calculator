/**
 * Battery Calculator Types
 * Тільки типи для Battery сторінки
 * Всі розрахунки виконуються на сервері
 */

import type { RackComponents, PriceData } from './rackCalculator';

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
 * Результат розрахунку battery (повертається з сервера)
 */
export interface BatteryCalculationResult {
  name: string;
  components: RackComponents;
  prices: Array<{
    type: 'базова' | 'без_ізоляторів' | 'нульова';
    label: string;
    value: number;
  }>;
  totalCost: number;
  rackConfigId?: number;
}

/**
 * Battery Variant для UI
 */
export interface BatteryVariant extends BatteryCalculationResult {
  _index?: number;
  span?: number;
  spansCount?: number;
  totalLength?: number;
  combination: number[];
  beams: number;
  batteriesPerRow?: number;
  excessLength?: number;
  isBest?: boolean;
  quantity?: number;
  setId?: number;
}

// Експортуємо тільки типи
export type { RackComponents, PriceData };
