import { Router } from 'express';
import { Role } from '../../database/models/role.model';
import { Permission } from '../../database/models/permission.model';
import { RolesRepository } from './roles.repository';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorizeRole } from '../../common/middleware/auth.middleware';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  CreatePermissionDto,
} from './dto';

/**
 * Roles Routes
 * Маршрути для управління ролями та дозволами
 */
export const rolesRoutes = Router();

// Ініціалізація залежностей
const rolesRepository = new RolesRepository(Role, Permission);
const rolesService = new RolesService(rolesRepository);
const rolesController = new RolesController(rolesService);

// ==========================================
// ROLE ROUTES
// ==========================================

/**
 * @route GET /api/roles
 * @description Get all roles
 * @access Private (Admin)
 */
rolesRoutes.get(
  '/',
  authenticate,
  authorizeRole('admin'),
  rolesController.getRoles,
);

/**
 * @route GET /api/roles/:id
 * @description Get role by ID
 * @access Private (Admin)
 */
rolesRoutes.get(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  rolesController.getRoleById,
);

/**
 * @route POST /api/roles
 * @description Create new role
 * @access Private (Admin)
 */
rolesRoutes.post(
  '/',
  authenticate,
  authorizeRole('admin'),
  validateRequest(CreateRoleDto),
  rolesController.createRole,
);

/**
 * @route PATCH /api/roles/:id
 * @description Update role
 * @access Private (Admin)
 */
rolesRoutes.patch(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  validateRequest(UpdateRoleDto),
  rolesController.updateRole,
);

/**
 * @route DELETE /api/roles/:id
 * @description Delete role
 * @access Private (Admin)
 */
rolesRoutes.delete(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  rolesController.deleteRole,
);

/**
 * @route POST /api/roles/:id/permissions
 * @description Assign permissions to role
 * @access Private (Admin)
 */
rolesRoutes.post(
  '/:id/permissions',
  authenticate,
  authorizeRole('admin'),
  validateRequest(AssignPermissionsDto),
  rolesController.assignPermissions,
);

/**
 * @route POST /api/roles/:id/permissions/:permissionId
 * @description Add permission to role
 * @access Private (Admin)
 */
rolesRoutes.post(
  '/:id/permissions/:permissionId',
  authenticate,
  authorizeRole('admin'),
  rolesController.addPermission,
);

/**
 * @route DELETE /api/roles/:id/permissions/:permissionId
 * @description Remove permission from role
 * @access Private (Admin)
 */
rolesRoutes.delete(
  '/:id/permissions/:permissionId',
  authenticate,
  authorizeRole('admin'),
  rolesController.removePermission,
);

// ==========================================
// PERMISSION ROUTES
// ==========================================

/**
 * @route GET /api/permissions
 * @description Get all permissions
 * @access Private (Admin)
 */
rolesRoutes.get(
  '/permissions',
  authenticate,
  authorizeRole('admin'),
  rolesController.getPermissions,
);

/**
 * @route GET /api/permissions/:id
 * @description Get permission by ID
 * @access Private (Admin)
 */
rolesRoutes.get(
  '/permissions/:id',
  authenticate,
  authorizeRole('admin'),
  rolesController.getPermissionById,
);

/**
 * @route POST /api/permissions
 * @description Create new permission
 * @access Private (Admin)
 */
rolesRoutes.post(
  '/permissions',
  authenticate,
  authorizeRole('admin'),
  validateRequest(CreatePermissionDto),
  rolesController.createPermission,
);

/**
 * @route PATCH /api/permissions/:id
 * @description Update permission
 * @access Private (Admin)
 */
rolesRoutes.patch(
  '/permissions/:id',
  authenticate,
  authorizeRole('admin'),
  rolesController.updatePermission,
);

/**
 * @route DELETE /api/permissions/:id
 * @description Delete permission
 * @access Private (Admin)
 */
rolesRoutes.delete(
  '/permissions/:id',
  authenticate,
  authorizeRole('admin'),
  rolesController.deletePermission,
);

export default rolesRoutes;
