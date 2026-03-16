/**
 * Вхідні дані для створення розрахунку
 */
export interface CreateCalculationInput {
  name: string;
  type: 'rack' | 'battery';
  data: any;
  description?: string;
  userId: string;
}

/**
 * Вхідні дані для оновлення розрахунку
 */
export interface UpdateCalculationInput {
  name?: string;
  data?: any;
  description?: string;
}

/**
 * Вхідні дані для отримання розрахунків
 */
export interface GetCalculationsInput {
  userId: string;
  type?: 'rack' | 'battery';
  page?: number;
  limit?: number;
}

/**
 * Результат операцій з розрахунком
 */
export interface CalculationResult {
  id: string;
  name: string;
  type: 'rack' | 'battery';
  data: any;
  description?: string;
  user: {
    id: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
