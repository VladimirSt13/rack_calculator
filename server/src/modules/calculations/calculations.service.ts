import { CalculationsRepository } from './calculations.repository';
import {
  CreateCalculationInput,
  UpdateCalculationInput,
  GetCalculationsInput,
  CalculationResult,
} from './calculations.types';
import { AuthError } from '../auth/auth.types';

/**
 * Calculations Service
 * Відповідає за бізнес-логіку управління розрахунками
 */
export class CalculationsService {
  private calculationsRepository: CalculationsRepository;

  constructor(calculationsRepository: CalculationsRepository) {
    this.calculationsRepository = calculationsRepository;
  }

  // ==========================================
  // GET CALCULATIONS
  // ==========================================

  /**
   * Отримати списк розрахунків з пагінацією
   */
  async getCalculations(input: GetCalculationsInput): Promise<{
    calculations: CalculationResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = input;

    const { calculations, total } = await this.calculationsRepository.findCalculations(input);

    return {
      calculations: calculations.map((calc) => this.mapToResult(calc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Отримати розрахунок за ID
   */
  async getCalculationById(id: string, userId: string): Promise<CalculationResult> {
    const calculation = await this.calculationsRepository.findCalculationById(id);

    if (!calculation) {
      throw new AuthError('Calculation not found', 'CALCULATION_NOT_FOUND');
    }

    // Перевірка прав доступу
    if (calculation.userId.toString() !== userId) {
      throw new AuthError('Access denied', 'FORBIDDEN');
    }

    return this.mapToResult(calculation);
  }

  /**
   * Отримати розрахунки користувача
   */
  async getUserCalculations(userId: string): Promise<CalculationResult[]> {
    const calculations = await this.calculationsRepository.findUserCalculations(userId);
    return calculations.map((calc) => this.mapToResult(calc));
  }

  // ==========================================
  // CREATE CALCULATION
  // ==========================================

  /**
   * Створити новий розрахунок
   */
  async createCalculation(input: CreateCalculationInput): Promise<CalculationResult> {
    const calculation = await this.calculationsRepository.createCalculation(
      input.userId,
      input.name,
      input.type,
      input.data,
      input.description,
    );

    return this.mapToResult(calculation);
  }

  // ==========================================
  // UPDATE CALCULATION
  // ==========================================

  /**
   * Оновити розрахунок
   */
  async updateCalculation(
    id: string,
    input: UpdateCalculationInput,
    userId: string,
  ): Promise<CalculationResult> {
    // Перевірка чи розрахунок існує
    const existingCalculation = await this.calculationsRepository.findCalculationById(id);
    if (!existingCalculation) {
      throw new AuthError('Calculation not found', 'CALCULATION_NOT_FOUND');
    }

    // Перевірка прав доступу
    if (existingCalculation.userId.toString() !== userId) {
      throw new AuthError('Access denied', 'FORBIDDEN');
    }

    const updatedCalculation = await this.calculationsRepository.update(id, input);

    if (!updatedCalculation) {
      throw new AuthError('Failed to update calculation', 'CALCULATION_NOT_FOUND');
    }

    return this.mapToResult(updatedCalculation);
  }

  // ==========================================
  // DELETE CALCULATION
  // ==========================================

  /**
   * Видалити розрахунок
   */
  async deleteCalculation(id: string, userId: string): Promise<void> {
    const calculation = await this.calculationsRepository.findCalculationById(id);

    if (!calculation) {
      throw new AuthError('Calculation not found', 'CALCULATION_NOT_FOUND');
    }

    // Перевірка прав доступу
    if (calculation.userId.toString() !== userId) {
      throw new AuthError('Access denied', 'FORBIDDEN');
    }

    await this.calculationsRepository.delete(id);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Маппінг документу в результат
   */
  private mapToResult(calculation: any): CalculationResult {
    return {
      id: calculation._id.toHexString(),
      name: calculation.name,
      type: calculation.type,
      data: calculation.data,
      description: calculation.description,
      user: {
        id: calculation.userId?._id?.toHexString() || calculation.userId,
        email: calculation.userId?.email || '',
      },
      createdAt: calculation.createdAt,
      updatedAt: calculation.updatedAt,
    };
  }
}

export default CalculationsService;
