/**
 * Вхідні дані для створення конфігурації стелажа
 */
export interface CreateRackConfigurationInput {
  name: string;
  type: string;
  rows: number;
  columns: number;
  levels: number;
  braceCount?: number;
  components: Array<{
    type: string;
    quantity: number;
    description?: string;
    price?: number;
  }>;
  description?: string;
  metadata?: any;
}

/**
 * Вхідні дані для оновлення конфігурації стелажа
 */
export interface UpdateRackConfigurationInput {
  name?: string;
  type?: string;
  rows?: number;
  columns?: number;
  levels?: number;
  braceCount?: number;
  components?: Array<{
    type: string;
    quantity: number;
    description?: string;
    price?: number;
  }>;
  description?: string;
  metadata?: any;
}

/**
 * Результат операцій з конфігурацією стелажа
 */
export interface RackConfigurationResult {
  id: string;
  name: string;
  type: string;
  rows: number;
  columns: number;
  levels: number;
  braceCount?: number;
  components: Array<{
    type: string;
    quantity: number;
    description?: string;
    price?: number;
  }>;
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}
