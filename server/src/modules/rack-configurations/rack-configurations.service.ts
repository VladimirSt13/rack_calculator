import { RackConfigurationsRepository } from './rack-configurations.repository';
import {
  CreateRackConfigurationInput,
  UpdateRackConfigurationInput,
  RackConfigurationResult,
} from './rack-configurations.types';
import { AuthError } from '../auth/auth.types';

/**
 * RackConfigurations Service
 * Відповідає за бізнес-логіку управління конфігураціями стелажів
 */
export class RackConfigurationsService {
  private rackConfigurationsRepository: RackConfigurationsRepository;

  constructor(rackConfigurationsRepository: RackConfigurationsRepository) {
    this.rackConfigurationsRepository = rackConfigurationsRepository;
  }

  // ==========================================
  // GET CONFIGURATIONS
  // ==========================================

  /**
   * Отримати всі конфігурації
   */
  async getConfigurations(type?: string): Promise<RackConfigurationResult[]> {
    const configurations = await this.rackConfigurationsRepository.findAllConfigurations(type);
    return configurations.map((config) => this.mapToResult(config));
  }

  /**
   * Отримати конфігурацію за ID
   */
  async getConfigurationById(id: string): Promise<RackConfigurationResult> {
    const configuration = await this.rackConfigurationsRepository.findConfigurationById(id);

    if (!configuration) {
      throw new AuthError('Configuration not found', 'CONFIGURATION_NOT_FOUND');
    }

    return this.mapToResult(configuration);
  }

  /**
   * Отримати конфігурації за типом
   */
  async getConfigurationsByType(type: string): Promise<RackConfigurationResult[]> {
    const configurations = await this.rackConfigurationsRepository.findConfigurationsByType(type);
    return configurations.map((config) => this.mapToResult(config));
  }

  /**
   * Отримати всі типи конфігурацій
   */
  async getConfigurationTypes(): Promise<string[]> {
    return await this.rackConfigurationsRepository.getConfigurationTypes();
  }

  // ==========================================
  // CREATE CONFIGURATION
  // ==========================================

  /**
   * Створити нову конфігурацію стелажа
   */
  async createConfiguration(input: CreateRackConfigurationInput): Promise<RackConfigurationResult> {
    // Перевірка чи конфігурація з такою назвою вже існує
    const exists = await this.rackConfigurationsRepository.configurationExists(input.name);
    if (exists) {
      throw new AuthError('Configuration with this name already exists', 'CONFIGURATION_EXISTS');
    }

    const configuration = await this.rackConfigurationsRepository.createConfiguration(
      input.name,
      input.type,
      input.rows,
      input.columns,
      input.levels,
      input.components,
      input.braceCount,
      input.description,
      input.metadata,
    );

    return this.mapToResult(configuration);
  }

  // ==========================================
  // UPDATE CONFIGURATION
  // ==========================================

  /**
   * Оновити конфігурацію стелажа
   */
  async updateConfiguration(
    id: string,
    input: UpdateRackConfigurationInput,
  ): Promise<RackConfigurationResult> {
    // Перевірка чи конфігурація існує
    const existingConfig = await this.rackConfigurationsRepository.findConfigurationById(id);
    if (!existingConfig) {
      throw new AuthError('Configuration not found', 'CONFIGURATION_NOT_FOUND');
    }

    // Перевірка чи нова назва не зайнята
    if (input.name && input.name !== existingConfig.name) {
      const exists = await this.rackConfigurationsRepository.configurationExists(input.name, id);
      if (exists) {
        throw new AuthError('Configuration with this name already exists', 'CONFIGURATION_EXISTS');
      }
    }

    const updatedConfig = await this.rackConfigurationsRepository.updateConfiguration(id, input);

    if (!updatedConfig) {
      throw new AuthError('Failed to update configuration', 'CONFIGURATION_NOT_FOUND');
    }

    return this.mapToResult(updatedConfig);
  }

  // ==========================================
  // DELETE CONFIGURATION
  // ==========================================

  /**
   * Видалити конфігурацію (soft delete)
   */
  async deleteConfiguration(id: string): Promise<void> {
    const configuration = await this.rackConfigurationsRepository.findConfigurationById(id);
    if (!configuration) {
      throw new AuthError('Configuration not found', 'CONFIGURATION_NOT_FOUND');
    }

    await this.rackConfigurationsRepository.softDelete(id);
  }

  /**
   * Відновити конфігурацію
   */
  async restoreConfiguration(id: string): Promise<RackConfigurationResult> {
    const restoredConfig = await this.rackConfigurationsRepository.restore(id);
    if (!restoredConfig) {
      throw new AuthError('Configuration not found', 'CONFIGURATION_NOT_FOUND');
    }

    return this.mapToResult(restoredConfig);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Маппінг документу в результат
   */
  private mapToResult(config: any): RackConfigurationResult {
    return {
      id: config._id.toHexString(),
      name: config.name,
      type: config.type,
      rows: config.rows,
      columns: config.columns,
      levels: config.levels,
      braceCount: config.braceCount,
      components: config.components || [],
      description: config.description,
      metadata: config.metadata,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

export default RackConfigurationsService;
