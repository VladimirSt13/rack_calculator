/**
 * Спільні типи для всього додатку
 */

/**
 * Типи цін для стелажів
 * Використовуються в rack та battery features
 */
export interface RackPrice {
  type:
    | "базова"
    | "без_ізоляторів"
    | "нульова"
    | "base"
    | "no_isolators"
    | "zero";
  value: number;
  label: string;
}

/**
 * Варіант стелажа з конфігурацією та компонентами
 * Використовується в rack та battery features
 */
export interface RackVariant {
  id: string;
  name: string;
  config: {
    floors: number;
    rows: number;
    beamsPerRow: number;
    spansArray?: number[];
  };
  components: ComponentItem[];
  prices?: RackPrice[];
  totalCost?: number;
}

/**
 * Елемент компонента
 */
export interface ComponentItem {
  code: string;
  name: string;
  quantity: number;
  price?: number;
  total?: number;
}
