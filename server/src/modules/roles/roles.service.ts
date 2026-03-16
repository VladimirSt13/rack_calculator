import { RolesRepository } from './roles.repository';
import { CreateRoleInput, UpdateRoleInput, CreatePermissionInput, RoleResult, PermissionResult } from './roles.types';
import { AuthError } from '../auth/auth.types';

/**
 * Roles Service
 * Відповідає за бізнес-логіку управління ролями та дозволами
 */
export class RolesService {
  private rolesRepository: RolesRepository;

  constructor(rolesRepository: RolesRepository) {
    this.rolesRepository = rolesRepository;
  }

  // ==========================================
  // ROLE METHODS
  // ==========================================

  /**
   * Отримати всі ролі
   */
  async getRoles(includePermissions: boolean = false): Promise<RoleResult[]> {
    const roles = await this.rolesRepository.findAllRoles(includePermissions);
    return roles.map((role) => this.mapRoleToResult(role));
  }

  /**
   * Отримати роль за ID
   */
  async getRoleById(id: string, includePermissions: boolean = true): Promise<RoleResult> {
    const role = await this.rolesRepository.findRoleById({ id, includePermissions });

    if (!role) {
      throw new AuthError('Role not found', 'ROLE_NOT_FOUND');
    }

    return this.mapRoleToResult(role);
  }

  /**
   * Створити роль
   */
  async createRole(input: CreateRoleInput): Promise<RoleResult> {
    // Перевірка чи роль вже існує
    const existingRole = await this.rolesRepository.findRoleByName(input.name);
    if (existingRole) {
      throw new AuthError('Role already exists', 'ROLE_EXISTS');
    }

    // Перевірка дозволів (якщо вказані)
    if (input.permissionIds && input.permissionIds.length > 0) {
      await this.validatePermissions(input.permissionIds);
    }

    const role = await this.rolesRepository.createRole(input.name, input.description, input.permissionIds);

    return this.mapRoleToResult(role);
  }

  /**
   * Оновити роль
   */
  async updateRole(id: string, input: UpdateRoleInput): Promise<RoleResult> {
    // Перевірка чи роль існує
    const existingRole = await this.rolesRepository.findRoleById({ id });
    if (!existingRole) {
      throw new AuthError('Role not found', 'ROLE_NOT_FOUND');
    }

    // Перевірка чи нова назва не зайнята
    if (input.name && input.name.toUpperCase() !== existingRole.name) {
      const roleWithSameName = await this.rolesRepository.findRoleByName(input.name);
      if (roleWithSameName) {
        throw new AuthError('Role with this name already exists', 'ROLE_EXISTS');
      }
    }

    // Оновлення ролі
    const updatedRole = await this.rolesRepository.updateRole(id, input.name, input.description);

    if (!updatedRole) {
      throw new AuthError('Failed to update role', 'ROLE_NOT_FOUND');
    }

    // Оновлення дозволів (якщо вказані)
    if (input.permissionIds) {
      await this.validatePermissions(input.permissionIds);
      await this.rolesRepository.assignPermissions(id, input.permissionIds);
    }

    return this.getRoleById(id);
  }

  /**
   * Видалити роль (soft delete)
   */
  async deleteRole(id: string): Promise<void> {
    const role = await this.rolesRepository.findRoleById({ id });
    if (!role) {
      throw new AuthError('Role not found', 'ROLE_NOT_FOUND');
    }

    // Не можна видаляти системні ролі
    if (['ADMIN', 'MANAGER', 'USER'].includes(role.name)) {
      throw new AuthError('Cannot delete system role', 'ROLE_DELETE_FORBIDDEN');
    }

    await this.rolesRepository.softDelete(id);
  }

  /**
   * Призначити дозволи ролі
   */
  async assignPermissions(roleId: string, permissionIds: string[]): Promise<RoleResult> {
    await this.validatePermissions(permissionIds);

    const role = await this.rolesRepository.assignPermissions(roleId, permissionIds);
    if (!role) {
      throw new AuthError('Role not found', 'ROLE_NOT_FOUND');
    }

    return this.mapRoleToResult(role);
  }

  /**
   * Додати дозвіл до ролі
   */
  async addPermission(roleId: string, permissionId: string): Promise<RoleResult> {
    await this.validatePermissions([permissionId]);

    const role = await this.rolesRepository.addPermissionToRole(roleId, permissionId);
    if (!role) {
      throw new AuthError('Role not found', 'ROLE_NOT_FOUND');
    }

    return this.mapRoleToResult(role);
  }

  /**
   * Видалити дозвіл з ролі
   */
  async removePermission(roleId: string, permissionId: string): Promise<RoleResult> {
    const role = await this.rolesRepository.removePermissionFromRole(roleId, permissionId);
    if (!role) {
      throw new AuthError('Role not found', 'ROLE_NOT_FOUND');
    }

    return this.mapRoleToResult(role);
  }

  // ==========================================
  // PERMISSION METHODS
  // ==========================================

  /**
   * Отримати всі дозволи
   */
  async getPermissions(): Promise<PermissionResult[]> {
    const permissions = await this.rolesRepository.findAllPermissions();
    return permissions.map((permission) => this.mapPermissionToResult(permission));
  }

  /**
   * Отримати дозвіл за ID
   */
  async getPermissionById(id: string): Promise<PermissionResult> {
    const permission = await this.rolesRepository.findPermissionById(id);

    if (!permission) {
      throw new AuthError('Permission not found', 'PERMISSION_NOT_FOUND');
    }

    return this.mapPermissionToResult(permission);
  }

  /**
   * Створити дозвіл
   */
  async createPermission(input: CreatePermissionInput): Promise<PermissionResult> {
    // Перевірка чи дозвіл вже існує
    const exists = await this.rolesRepository.permissionExists(input.resource, input.action);
    if (exists) {
      throw new AuthError('Permission already exists', 'PERMISSION_EXISTS');
    }

    const permission = await this.rolesRepository.createPermission(
      input.name,
      input.resource,
      input.action,
      input.description,
    );

    return this.mapPermissionToResult(permission);
  }

  /**
   * Оновити дозвіл
   */
  async updatePermission(id: string, name?: string, description?: string): Promise<PermissionResult> {
    const permission = await this.rolesRepository.updatePermission(id, name, description);

    if (!permission) {
      throw new AuthError('Permission not found', 'PERMISSION_NOT_FOUND');
    }

    return this.mapPermissionToResult(permission);
  }

  /**
   * Видалити дозвіл
   */
  async deletePermission(id: string): Promise<void> {
    const permission = await this.rolesRepository.deletePermission(id);
    if (!permission) {
      throw new AuthError('Permission not found', 'PERMISSION_NOT_FOUND');
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Перевірити чи існують дозволи
   */
  private async validatePermissions(permissionIds: string[]): Promise<void> {
    for (const permissionId of permissionIds) {
      const permission = await this.rolesRepository.findPermissionById(permissionId);
      if (!permission || permission.deleted) {
        throw new AuthError(`Permission not found: ${permissionId}`, 'PERMISSION_NOT_FOUND');
      }
    }
  }

  /**
   * Маппінг документу ролі в результат
   */
  private mapRoleToResult(role: any): RoleResult {
    return {
      id: role._id.toHexString(),
      name: role.name,
      description: role.description,
      permissions: role.permissions?.map((p: any) => this.mapPermissionToResult(p)) || [],
      createdAt: role.createdAt,
      deleted: role.deleted,
    };
  }

  /**
   * Маппінг документу дозволу в результат
   */
  private mapPermissionToResult(permission: any): PermissionResult {
    return {
      id: permission._id.toHexString(),
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
    };
  }
}

export default RolesService;
