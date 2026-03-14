import api from "@/features/auth/authApi";

export interface Role {
  id: number;
  name: string;
  label: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  permissions?: Array<{
    name: string;
    label: string;
    category: string;
  }>;
}

export const rolesApi = {
  /**
   * Отримати всі ролі
   */
  getAll: async () => {
    const { data } = await api.get("/roles");
    return data.roles || [];
  },

  /**
   * Отримати дозволи ролі
   */
  getPermissions: async (roleName: string) => {
    const { data } = await api.get(`/roles/${roleName}/permissions`);
    return data;
  },

  /**
   * Оновити дозволи ролі
   */
  updatePermissions: async (roleName: string, permissions: string[]) => {
    const { data } = await api.put(`/roles/${roleName}/permissions`, {
      permissions,
    });
    return data;
  },

  /**
   * Отримати типи цін ролі
   */
  getPriceTypes: async (roleName: string) => {
    const { data } = await api.get(`/roles/${roleName}/price-types`);
    return data;
  },

  /**
   * Оновити типи цін ролі
   */
  updatePriceTypes: async (roleName: string, priceTypes: string[]) => {
    const { data } = await api.put(`/roles/${roleName}/price-types`, {
      price_types: priceTypes,
    });
    return data;
  },

  /**
   * Створити нову роль
   */
  create: async (roleData: {
    name: string;
    label: string;
    description?: string;
    permissions?: string[];
    price_types?: string[];
  }) => {
    const { data } = await api.post("/roles", roleData);
    return data;
  },
};

export default rolesApi;
