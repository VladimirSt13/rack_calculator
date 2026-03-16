import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../common/utils/jwt.service';
import { ApiResponder } from '../../common/utils/api-response';

const jwtService = new JwtService();

/**
 * Розширений Request з даними користувача
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roleId?: string;
    permissions?: string[];
  };
}

/**
 * Middleware для перевірки JWT токена
 *
 * @example
 * router.get('/profile', authenticate, profileController.getProfile);
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Отримати токен з заголовка
    const token = extractTokenFromHeader(req);

    if (!token) {
      ApiResponder.unauthorized(res, 'Access token is required');
      return;
    }

    // Верифікувати токен
    const payload = await jwtService.verifyAccessToken(token);

    // Додати дані користувача до request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      roleId: payload.roleId,
      permissions: payload.permissions,
    };

    next();
  } catch (error) {
    ApiResponder.unauthorized(res, 'Invalid or expired access token');
  }
};

/**
 * Middleware з опціональною авторизацією
 * Якщо токен є - додає користувача, якщо ні - пропускає
 *
 * @example
 * router.get('/public-data', optionalAuth, controller.getData);
 */
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req);

    if (token) {
      const payload = await jwtService.verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        roleId: payload.roleId,
        permissions: payload.permissions,
      };
    }

    next();
  } catch (error) {
    // Ігноруємо помилку, токен просто недійсний
    next();
  }
};

/**
 * Middleware для перевірки ролі
 *
 * @param roles - Масив дозволених ролей
 *
 * @example
 * router.delete('/users/:id', authenticate, authorizeRole('admin'), usersController.deleteUser);
 */
export const authorizeRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      ApiResponder.unauthorized(res, 'Authentication required');
      return;
    }

    const userRole = req.user.roleId;

    if (!userRole || !roles.includes(userRole)) {
      ApiResponder.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

/**
 * Middleware для перевірки дозволу
 *
 * @param permission - Назва дозволу (напр, 'users:create')
 *
 * @example
 * router.post('/users', authenticate, authorizePermission('users:create'), usersController.createUser);
 */
export const authorizePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      ApiResponder.unauthorized(res, 'Authentication required');
      return;
    }

    const permissions = req.user.permissions || [];

    // Перевірка чи є дозвіл або 'all'
    if (!permissions.includes(permission) && !permissions.includes('all')) {
      ApiResponder.forbidden(res, `Permission '${permission}' required`);
      return;
    }

    next();
  };
};

/**
 * Витягнути токен з Authorization заголовка
 */
function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Decorator для позначення публічних роутів (для майбутнього використання з guards)
 */
export const publicRoute = () => {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    // Маркер для майбутнього використання
    return descriptor;
  };
};

export default authenticate;
