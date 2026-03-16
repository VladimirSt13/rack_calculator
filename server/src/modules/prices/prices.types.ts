/**
 * Вхідні дані для отримання прайсу
 */
export interface GetPriceInput {
  category?: string;
}

/**
 * Вхідні дані для створення прайсу
 */
export interface CreatePriceInput {
  data: any;
  category?: string;
}

/**
 * Вхідні дані для оновлення прайсу
 */
export interface UpdatePriceInput {
  data?: any;
  category?: string;
}

/**
 * Вхідні дані для компонента прайсу
 */
export interface CreatePriceComponentInput {
  name: string;
  category: string;
  price: number;
  unit?: string;
  metadata?: any;
}

/**
 * Вхідні дані для оновлення компонента прайсу
 */
export interface UpdatePriceComponentInput {
  name?: string;
  category?: string;
  price?: number;
  unit?: string;
  metadata?: any;
}

/**
 * Результат операцій з прайсом
 */
export interface PriceResult {
  id: string;
  data: any;
  category?: string;
  updatedAt: Date;
}

/**
 * Результат операцій з компонентом прайсу
 */
export interface PriceComponentResult {
  id: string;
  name: string;
  category: string;
  price: number;
  unit?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}
