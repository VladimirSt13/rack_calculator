import { Request, Response, NextFunction } from 'express';
import { ApiResponder } from '../utils/api-response';
import { AuthError } from '../../modules/auth/auth.types';

/**
 * Middleware для обробки помилок
 */
export const errorMiddleware = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Логування помилки
  console.error('[Error]', err);

  // AuthError
  if (err instanceof AuthError) {
    switch (err.code) {
      case 'INVALID_CREDENTIALS':
      case 'USER_NOT_FOUND':
        ApiResponder.unauthorized(res, err.message);
        break;
      case 'USER_EXISTS':
        ApiResponder.badRequest(res, err.message);
        break;
      case 'TOKEN_EXPIRED':
      case 'TOKEN_INVALID':
        ApiResponder.unauthorized(res, err.message);
        break;
      case 'EMAIL_NOT_VERIFIED':
        ApiResponder.forbidden(res, err.message);
        break;
      case 'ROLE_NOT_FOUND':
      case 'PERMISSION_NOT_FOUND':
      case 'PRICE_NOT_FOUND':
      case 'CONFIGURATION_NOT_FOUND':
      case 'RACKSET_NOT_FOUND':
      case 'CALCULATION_NOT_FOUND':
        ApiResponder.notFound(res, err.message);
        break;
      case 'FORBIDDEN':
        ApiResponder.forbidden(res, err.message);
        break;
      default:
        ApiResponder.badRequest(res, err.message);
    }
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    ApiResponder.badRequest(res, err.message);
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    ApiResponder.badRequest(res, `${field} already exists`);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    ApiResponder.badRequest(res, 'Invalid ID format');
    return;
  }

  // JSON parse error
  if (err instanceof SyntaxError && 'body' in err) {
    ApiResponder.badRequest(res, 'Invalid JSON');
    return;
  }

  // Default error
  ApiResponder.error(
    res,
    {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    },
    500,
  );
};

export default errorMiddleware;
