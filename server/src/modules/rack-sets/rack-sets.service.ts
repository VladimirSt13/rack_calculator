import { RackSetsRepository } from './rack-sets.repository';
import {
  CreateRackSetInput,
  UpdateRackSetInput,
  GetRackSetsInput,
  RackSetResult,
  RackSetRevisionResult,
} from './rack-sets.types';
import { AuthError } from '../auth/auth.types';

/**
 * RackSets Service
 * Відповідає за бізнес-логіку управління комплектами стелажів
 */
export class RackSetsService {
  private rackSetsRepository: RackSetsRepository;

  constructor(rackSetsRepository: RackSetsRepository) {
    this.rackSetsRepository = rackSetsRepository;
  }

  // ==========================================
  // GET RACKSETS
  // ==========================================

  /**
   * Отримати списк комплектів з пагінацією
   */
  async getRackSets(input: GetRackSetsInput): Promise<{
    rackSets: RackSetResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = input;

    const { rackSets, total } = await this.rackSetsRepository.findRackSets(input);

    return {
      rackSets: rackSets.map((rackSet) => this.mapToResult(rackSet)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Отримати комплект за ID
   */
  async getRackSetById(id: string): Promise<RackSetResult> {
    const rackSet = await this.rackSetsRepository.findRackSetById(id);

    if (!rackSet) {
      throw new AuthError('RackSet not found', 'RACKSET_NOT_FOUND');
    }

    return this.mapToResult(rackSet);
  }

  /**
   * Отримати ревізії комплекту
   */
  async getRackSetRevisions(rackSetId: string): Promise<RackSetRevisionResult[]> {
    const revisions = await this.rackSetsRepository.getRevisions(rackSetId);

    return revisions.map((revision) => this.mapRevisionToResult(revision));
  }

  // ==========================================
  // CREATE RACKSET
  // ==========================================

  /**
   * Створити новий комплект стелажів
   */
  async createRackSet(input: CreateRackSetInput): Promise<RackSetResult> {
    // Створення комплекту
    const rackSet = await this.rackSetsRepository.createRackSet(input.userId, input.name, input.description);

    // Створення першої ревізії
    await this.rackSetsRepository.createRevision(rackSet._id, 1, input.racks, input.userId);

    return this.mapToResult(rackSet);
  }

  // ==========================================
  // UPDATE RACKSET
  // ==========================================

  /**
   * Оновити комплект стелажів з новою ревізією
   */
  async updateRackSet(id: string, input: UpdateRackSetInput, userId: string): Promise<RackSetResult> {
    // Перевірка чи комплект існує
    const existingRackSet = await this.rackSetsRepository.findRackSetById(id);
    if (!existingRackSet) {
      throw new AuthError('RackSet not found', 'RACKSET_NOT_FOUND');
    }

    // Перевірка прав доступу
    if (existingRackSet.userId.toString() !== userId) {
      throw new AuthError('Access denied', 'FORBIDDEN');
    }

    // Оновлення даних комплекту
    const updateData: any = {};
    if (input.name) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;

    const updatedRackSet = await this.rackSetsRepository.updateRackSet(id, updateData);

    if (!updatedRackSet) {
      throw new AuthError('Failed to update RackSet', 'RACKSET_NOT_FOUND');
    }

    // Якщо є нові racks - створити нову ревізію
    if (input.racks && input.racks.length > 0) {
      const newRevisionNumber = updatedRackSet.currentRevision + 1;

      await this.rackSetsRepository.createRevision(updatedRackSet._id, newRevisionNumber, input.racks, userId);

      await this.rackSetsRepository.incrementRevision(updatedRackSet._id);
    }

    return this.getRackSetById(id);
  }

  // ==========================================
  // DELETE RACKSET
  // ==========================================

  /**
   * Видалити комплект (soft delete)
   */
  async deleteRackSet(id: string, userId: string): Promise<void> {
    const rackSet = await this.rackSetsRepository.findRackSetById(id);

    if (!rackSet) {
      throw new AuthError('RackSet not found', 'RACKSET_NOT_FOUND');
    }

    // Перевірка прав доступу
    if (rackSet.userId.toString() !== userId) {
      throw new AuthError('Access denied', 'FORBIDDEN');
    }

    await this.rackSetsRepository.softDelete(id);
  }

  /**
   * Відновити комплект
   */
  async restoreRackSet(id: string): Promise<RackSetResult> {
    const restoredRackSet = await this.rackSetsRepository.restore(id);

    if (!restoredRackSet) {
      throw new AuthError('RackSet not found', 'RACKSET_NOT_FOUND');
    }

    return this.mapToResult(restoredRackSet);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Маппінг документу в результат
   */
  private mapToResult(rackSet: any): RackSetResult {
    return {
      id: rackSet._id.toHexString(),
      name: rackSet.name,
      description: rackSet.description,
      user: {
        id: rackSet.userId?._id?.toHexString() || rackSet.userId,
        email: rackSet.userId?.email || '',
      },
      currentRevision: rackSet.currentRevision,
      racks: [], // Racks отримуються з ревізій
      deleted: rackSet.deleted,
      createdAt: rackSet.createdAt,
      updatedAt: rackSet.updatedAt,
    };
  }

  /**
   * Маппінг ревізії в результат
   */
  private mapRevisionToResult(revision: any): RackSetRevisionResult {
    return {
      id: revision._id.toHexString(),
      revisionNumber: revision.revisionNumber,
      racks: revision.racks,
      createdAt: revision.createdAt,
      createdBy: {
        id: revision.createdBy?._id?.toHexString() || revision.createdBy,
        email: revision.createdBy?.email || '',
      },
    };
  }
}

export default RackSetsService;
