/**
 * Категорії прайсу
 * Використовується для відображення назв на клієнті
 */

export const CATEGORY_NAMES = {
  supports: 'Опори',
  spans: 'Балки',
  vertical_supports: 'Вертикальні опори',
  diagonal_brace: 'Розкоси',
  isolator: 'Ізолятори',
} as const;

/**
 * Тип категорії
 */
export type PriceCategory = keyof typeof CATEGORY_NAMES;

/**
 * Перевірка чи є ключ валідною категорією
 */
export function isValidPriceCategory(key: string): key is PriceCategory {
  return key in CATEGORY_NAMES;
}

/**
 * Масив всіх категорій
 */
export const PRICE_CATEGORIES_ARRAY = Object.keys(CATEGORY_NAMES) as PriceCategory[];
