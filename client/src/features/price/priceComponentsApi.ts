import api from '@/lib/axios';

/**
 * Price Component DTOs
 */
export interface PriceComponent {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePriceComponentDto {
  name: string;
  category: string;
  price: number;
  unit: string;
}

export interface UpdatePriceComponentDto {
  name?: string;
  category?: string;
  price?: number;
  unit?: string;
}

/**
 * Price Component Categories
 */
export type PriceComponentCategory = 
  | 'rack'
  | 'battery'
  | 'panels'
  | 'supports'
  | 'spans'
  | 'vertical_supports'
  | 'diagonal_brace'
  | 'isolator'
  | string;

/**
 * Price Components API
 * Маршрути для управління компонентами прайсу
 */
export const priceComponentsApi = {
  /**
   * Отримати всі компоненти прайсу
   * GET /api/price-components
   */
  getAll: async (): Promise<PriceComponent[]> => {
    const { data } = await api.get('/price-components');
    return data.data || [];
  },

  /**
   * Отримати компонент за ID
   * GET /api/price-components/:id
   */
  getById: async (id: number): Promise<PriceComponent> => {
    const { data } = await api.get(`/price-components/${id}`);
    return data.data;
  },

  /**
   * Отримати категорії компонентів
   * GET /api/price-components/categories
   */
  getCategories: async (): Promise<string[]> => {
    const { data } = await api.get('/price-components/categories');
    return data.data || [];
  },

  /**
   * Створити новий компонент
   * POST /api/price-components
   */
  create: async (componentData: CreatePriceComponentDto): Promise<PriceComponent> => {
    const { data } = await api.post('/price-components', componentData);
    return data.data;
  },

  /**
   * Оновити компонент
   * PATCH /api/price-components/:id
   */
  update: async (
    id: number,
    componentData: UpdatePriceComponentDto
  ): Promise<PriceComponent> => {
    const { data } = await api.patch(`/price-components/${id}`, componentData);
    return data.data;
  },

  /**
   * Видалити компонент
   * DELETE /api/price-components/:id
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/price-components/${id}`);
  },
};

export default priceComponentsApi;
