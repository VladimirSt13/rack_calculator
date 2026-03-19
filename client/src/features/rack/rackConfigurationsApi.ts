import api from '@/lib/axios';

/**
 * Rack Configuration Component
 */
export interface RackConfigComponent {
  name: string;
  amount: number;
}

/**
 * Rack Configuration
 */
export interface RackConfiguration {
  id: number;
  name: string;
  type: 'rack' | 'battery' | string;
  length: number;   // мм
  width: number;    // мм
  height: number;   // мм
  gap?: number;     // мм
  components: RackConfigComponent[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Rack Configuration DTO
 */
export interface CreateRackConfigurationDto {
  name: string;
  type: string;
  length: number;
  width: number;
  height: number;
  gap?: number;
  components: RackConfigComponent[];
}

/**
 * Update Rack Configuration DTO
 */
export interface UpdateRackConfigurationDto {
  name?: string;
  type?: string;
  length?: number;
  width?: number;
  height?: number;
  gap?: number;
  components?: RackConfigComponent[];
}

/**
 * Rack Configurations API
 * Маршрути для управління конфігураціями стелажів
 */
export const rackConfigurationsApi = {
  /**
   * Отримати всі конфігурації стелажів
   * GET /api/rack-configurations
   */
  getAll: async (params?: { type?: string }): Promise<RackConfiguration[]> => {
    const { data } = await api.get('/rack-configurations', { params });
    return data.data || [];
  },

  /**
   * Отримати типи конфігурацій
   * GET /api/rack-configurations/types
   */
  getTypes: async (): Promise<string[]> => {
    const { data } = await api.get('/rack-configurations/types');
    return data.data || [];
  },

  /**
   * Отримати конфігурацію за ID
   * GET /api/rack-configurations/:id
   */
  getById: async (id: number): Promise<RackConfiguration> => {
    const { data } = await api.get(`/rack-configurations/${id}`);
    return data.data;
  },

  /**
   * Створити нову конфігурацію
   * POST /api/rack-configurations
   */
  create: async (
    configData: CreateRackConfigurationDto
  ): Promise<RackConfiguration> => {
    const { data } = await api.post('/rack-configurations', configData);
    return data.data;
  },

  /**
   * Оновити конфігурацію
   * PATCH /api/rack-configurations/:id
   */
  update: async (
    id: number,
    configData: UpdateRackConfigurationDto
  ): Promise<RackConfiguration> => {
    const { data } = await api.patch(`/rack-configurations/${id}`, configData);
    return data.data;
  },

  /**
   * Видалити конфігурацію
   * DELETE /api/rack-configurations/:id
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/rack-configurations/${id}`);
  },
};

export default rackConfigurationsApi;
