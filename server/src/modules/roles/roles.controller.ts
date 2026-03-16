import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, CreatePermissionDto } from './dto';

/**
 * Roles Controller
 * Обробка HTTP запитів для управління ролями та дозволами
 */
export class RolesController {
  private rolesService: RolesService;

  constructor(rolesService: RolesService) {
    this.rolesService = rolesService;
  }

  // ==========================================
  // ROLE METHODS
  // ==========================================

  /**
   * Отримати всі ролі
   * GET /api/roles
   */
  getRoles = asyncHandler(async (req: Request, res: Response) => {
    const includePermissions = req.query.includePermissions === 'true';
    const result = await this.rolesService.getRoles(includePermissions);
    ApiResponder.success(res, { roles: result, total: result.length });
  });

  /**
   * Отримати роль за ID
   * GET /api/roles/:id
   */
  getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.rolesService.getRoleById(id);
    ApiResponder.success(res, result);
  });

  /**
   * Створити роль
   * POST /api/roles
   */
  createRole = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateRoleDto = req.body;
    const result = await this.rolesService.createRole(dto);
    ApiResponder.created(res, result);
  });

  /**
   * Оновити роль
   * PATCH /api/roles/:id
   */
  updateRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: UpdateRoleDto = req.body;
    const result = await this.rolesService.updateRole(id, dto);
    ApiResponder.success(res, result);
  });

  /**
   * Видалити роль
   * DELETE /api/roles/:id
   */
  deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.rolesService.deleteRole(id);
    ApiResponder.success(res, { message: 'Role deleted successfully' });
  });

  /**
   * Призначити дозволи ролі
   * POST /api/roles/:id/permissions
   */
  assignPermissions = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: AssignPermissionsDto = req.body;
    const result = await this.rolesService.assignPermissions(id, dto.permissionIds);
    ApiResponder.success(res, result);
  });

  /**
   * Додати дозвіл до ролі
   * POST /api/roles/:id/permissions/:permissionId
   */
  addPermission = asyncHandler(async (req: Request, res: Response) => {
    const { id, permissionId } = req.params;
    const result = await this.rolesService.addPermission(id, permissionId);
    ApiResponder.success(res, result);
  });

  /**
   * Видалити дозвіл з ролі
   * DELETE /api/roles/:id/permissions/:permissionId
   */
  removePermission = asyncHandler(async (req: Request, res: Response) => {
    const { id, permissionId } = req.params;
    const result = await this.rolesService.removePermission(id, permissionId);
    ApiResponder.success(res, result);
  });

  // ==========================================
  // PERMISSION METHODS
  // ==========================================

  /**
   * Отримати всі дозволи
   * GET /api/permissions
   */
  getPermissions = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.rolesService.getPermissions();
    ApiResponder.success(res, { permissions: result, total: result.length });
  });

  /**
   * Отримати дозвіл за ID
   * GET /api/permissions/:id
   */
  getPermissionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.rolesService.getPermissionById(id);
    ApiResponder.success(res, result);
  });

  /**
   * Створити дозвіл
   * POST /api/permissions
   */
  createPermission = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreatePermissionDto = req.body;
    const result = await this.rolesService.createPermission(dto);
    ApiResponder.created(res, result);
  });

  /**
   * Оновити дозвіл
   * PATCH /api/permissions/:id
   */
  updatePermission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await this.rolesService.updatePermission(id, name, description);
    ApiResponder.success(res, result);
  });

  /**
   * Видалити дозвіл
   * DELETE /api/permissions/:id
   */
  deletePermission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.rolesService.deletePermission(id);
    ApiResponder.success(res, { message: 'Permission deleted successfully' });
  });
}

export default RolesController;
