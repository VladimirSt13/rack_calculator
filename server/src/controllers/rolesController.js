import * as rolesService from '../services/rolesService.js';

/**
 * GET /api/roles
 * Получить все роли
 */
export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await rolesService.getAllRolesWithPermissions();
    res.json({ roles });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/roles/:name/permissions
 * Получить разрешения роли
 */
export const getRolePermissions = async (req, res, next) => {
  try {
    const { name } = req.params;
    const permissions = await rolesService.getRolePermissions(name);
    res.json({ permissions });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/roles/:name/permissions
 * Обновить разрешения роли
 */
export const updateRolePermissions = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { permissions } = req.body;

    const result = await rolesService.updateRolePermissionsService(
      name,
      permissions,
      req.user.userId,
      req.ip,
      req.get('user-agent')
    );

    res.json(result);
  } catch (error) {
    if (error.message === 'Permissions must be an array' || error.message === 'Failed to update permissions') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * GET /api/roles/:name/price-types
 * Получить типы цен роли
 */
export const getRolePriceTypes = async (req, res, next) => {
  try {
    const { name } = req.params;
    const priceTypes = await rolesService.getRolePriceTypes(name);
    res.json({ price_types: priceTypes });
  } catch (error) {
    if (error.message === 'Role not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PUT /api/roles/:name/price-types
 * Обновить типы цен роли
 */
export const updateRolePriceTypes = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { price_types } = req.body;

    const result = await rolesService.updateRolePriceTypesService(
      name,
      price_types,
      req.user.userId,
      req.ip,
      req.get('user-agent')
    );

    res.json(result);
  } catch (error) {
    if (error.message === 'Price types must be an array' || error.message === 'Failed to update price types') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/roles
 * Создать новую роль
 */
export const createRole = async (req, res, next) => {
  try {
    const { name, label, description, permissions, price_types } = req.body;

    const result = await rolesService.createRole(
      { name, label, description, permissions, price_types },
      req.user.userId,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Role already exists') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};
