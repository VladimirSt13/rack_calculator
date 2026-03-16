import { Response } from 'express';
import { ApiError, PaginationMeta, HttpStatus } from '../types';

/**
 * Helper для формування відповідей API
 */
export class ApiResponder {
  /**
   * Успішна відповідь з даними
   */
  static success<T>(res: Response, data: T, status: number = HttpStatus.OK): Response {
    return res.status(status).json({
      success: true,
      data,
    });
  }

  /**
   * Успішна відповідь з пагінацією
   */
  static paginated<T>(res: Response, items: T[], meta: PaginationMeta, status: number = HttpStatus.OK): Response {
    return res.status(status).json({
      success: true,
      data: items,
      meta,
    });
  }

  /**
   * Відповідь з помилкою
   */
  static error(res: Response, error: ApiError | string, status: number = HttpStatus.INTERNAL_SERVER_ERROR): Response {
    const errorObj: ApiError = typeof error === 'string' ? { code: 'ERROR', message: error } : error;

    return res.status(status).json({
      success: false,
      error: errorObj,
    });
  }

  /**
   * Відповідь "Створено" (201)
   */
  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, HttpStatus.CREATED);
  }

  /**
   * Відповідь "Немає вмісту" (204)
   */
  static noContent(res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  /**
   * Відповідь "Не знайдено" (404)
   */
  static notFound(res: Response, message: string = 'Not found'): Response {
    return this.error(res, { code: 'NOT_FOUND', message }, HttpStatus.NOT_FOUND);
  }

  /**
   * Відповідь "Поганий запит" (400)
   */
  static badRequest(res: Response, message: string): Response {
    return this.error(res, { code: 'BAD_REQUEST', message }, HttpStatus.BAD_REQUEST);
  }

  /**
   * Відповідь "Не авторизовано" (401)
   */
  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, { code: 'UNAUTHORIZED', message }, HttpStatus.UNAUTHORIZED);
  }

  /**
   * Відповідь "Заборонено" (403)
   */
  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, { code: 'FORBIDDEN', message }, HttpStatus.FORBIDDEN);
  }
}

export default ApiResponder;
