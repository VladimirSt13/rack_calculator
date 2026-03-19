import api from '@/features/auth/authApi';

export interface Role {
  id: number;
  name: string;
  label: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  permissions?: Array<{
    id: number;
    resource: string;
    action: string;
    description?: string;
  }>;
}

export interface Permission {
  id: number;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: number[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: number[];
}

export interface CreatePermissionDto {
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionDto {
  resource?: string;
  action?: string;
  description?: string;
}

export const rolesApi = {
  /**
   * Отримати всі ролі
   * GET /api/roles
   */
  getAll: async (): Promise<Role[]> => {
    const { data } = await api.get('/roles');
    return data.data || [];
  },

  /**
   * Отримати роль за ID
   * GET /api/roles/:id
   */
  getById: async (id: number): Promise<Role> => {
    const { data } = await api.get(`/roles/${id}`);
    return data.data;
  },

  /**
   * Створити нову роль
   * POST /api/roles
   */
  create: async (roleData: CreateRoleDto): Promise<Role> => {
    const { data } = await api.post('/roles', roleData);
    return data.data;
  },

  /**
   * Оновити роль
   * PATCH /api/roles/:id
   */
  update: async (id: number, roleData: UpdateRoleDto): Promise<Role> => {
    const { data } = await api.patch(`/roles/${id}`, roleData);
    return data.data;
  },

  /**
   * Видалити роль
   * DELETE /api/roles/:id
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },

  /**
   * Призначити дозволи ролі
   * POST /api/roles/:id/permissions
   */
  assignPermissions: async (roleId: number, permissionIds: number[]): Promise<Role> => {
    const { data } = await api.post(`/roles/${roleId}/permissions`, {
      permissions: permissionIds,
    });
    return data.data;
  },

  /**
   * Додати один дозвіл до ролі
   * POST /api/roles/:id/permissions/:permissionId
   */
  addPermission: async (roleId: number, permissionId: number): Promise<void> => {
    await api.post(`/roles/${roleId}/permissions/${permissionId}`);
  },

  /**
   * Видалити дозвіл з ролі
   * DELETE /api/roles/:id/permissions/:permissionId
   */
  removePermission: async (roleId: number, permissionId: number): Promise<void> => {
    await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  },

  /**
   * Отримати всі дозволи
   * GET /api/permissions
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    const { data } = await api.get('/permissions');
    return data.data || [];
  },

  /**
   * Отримати дозвіл за ID
   * GET /api/permissions/:id
   */
  getPermissionById: async (id: number): Promise<Permission> => {
    const { data } = await api.get(`/permissions/${id}`);
    return data.data;
  },

  /**
   * Створити новий дозвіл
   * POST /api/permissions
   */
  createPermission: async (permissionData: CreatePermissionDto): Promise<Permission> => {
    const { data } = await api.post('/permissions', permissionData);
    return data.data;
  },

  /**
   * Оновити дозвіл
   * PATCH /api/permissions/:id
   */
  updatePermission: async (id: number, permissionData: UpdatePermissionDto): Promise<Permission> => {
    const { data } = await api.patch(`/permissions/${id}`, permissionData);
    return data.data;
  },

  /**
   * Видалити дозвіл
   * DELETE /api/permissions/:id
   */
  deletePermission: async (id: number): Promise<void> => {
    await api.delete(`/permissions/${id}`);
  },

  /**
   * Отримати типи цін ролі (legacy, для сумісності)
   * @deprecated Використовуйте getById()
   */
  getPriceTypes: async (roleName: string): Promise<string[]> => {
    console.warn('getPriceTypes deprecated - use getById() instead');
    const { data } = await api.get(`/roles/${roleName}/price-types`);
    return data.data || [];
  },

  /**
   * Оновити типи цін ролі (legacy, для сумісності)
   * @deprecated Використовуйте update()
   */
  updatePriceTypes: async (roleName: string, priceTypes: string[]): Promise<Role> => {
    console.warn('updatePriceTypes deprecated - use update() instead');
    const { data } = await api.put(`/roles/${roleName}/price-types`, {
      price_types: priceTypes,
    });
    return data.data;
  },
};

export default rolesApi;
