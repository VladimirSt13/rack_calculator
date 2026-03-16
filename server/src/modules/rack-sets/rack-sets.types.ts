import { Types } from 'mongoose';

/**
 * Вхідні дані для створення комплекту стелажів
 */
export interface CreateRackSetInput {
  name: string;
  description?: string;
  userId: string | Types.ObjectId;
  racks: Array<{
    configurationId: string | Types.ObjectId;
    name: string;
    rows: number;
    columns: number;
    levels: number;
    braceCount?: number;
    components?: any[];
  }>;
}

/**
 * Вхідні дані для оновлення комплекту стелажів
 */
export interface UpdateRackSetInput {
  name?: string;
  description?: string;
  racks?: Array<{
    configurationId: string | Types.ObjectId;
    name: string;
    rows: number;
    columns: number;
    levels: number;
    braceCount?: number;
    components?: any[];
  }>;
}

/**
 * Вхідні дані для отримання комплектів
 */
export interface GetRackSetsInput {
  userId?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

/**
 * Результат операцій з комплектом стелажів
 */
export interface RackSetResult {
  id: string;
  name: string;
  description?: string;
  user: {
    id: string;
    email: string;
  };
  currentRevision: number;
  racks: Array<{
    id?: string;
    configurationId: string;
    name: string;
    rows: number;
    columns: number;
    levels: number;
    braceCount?: number;
    components?: any[];
  }>;
  deleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Результат операцій з ревізією
 */
export interface RackSetRevisionResult {
  id: string;
  revisionNumber: number;
  racks: any[];
  createdAt: Date;
  createdBy: {
    id: string;
    email: string;
  };
}
