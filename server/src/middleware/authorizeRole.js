import { hasRole } from '../helpers/roles.js';

/**
 * Middleware для перевірки ролі користувача
 * 
 * @param  {...string} allowedRoles - Дозволені ролі
 * @returns {Function}
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!hasRole(req.user, ...allowedRoles)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Middleware для перевірки конкретних permissions
 * 
 * @param {string} permissionType - Тип permission (напр. 'price_types')
 * @param {string} permissionValue - Значення permission
 * @returns {Function}
 */
export const authorizePermission = (permissionType, permissionValue) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const permissions = req.user.permissions || {};
    const hasPermission = permissions[permissionType]?.includes?.(permissionValue);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        required: `${permissionType}.${permissionValue}`
      });
    }
    
    next();
  };
};

export default {
  authorizeRole,
  authorizePermission,
};
