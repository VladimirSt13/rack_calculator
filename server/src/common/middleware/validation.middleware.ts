import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';

/**
 * Middleware для валідації DTO
 *
 * @param DtoClass - Клас DTO для валідації
 *
 * @example
 * router.post('/login', validateRequest(LoginDto), authController.login);
 */
export const validateRequest = (DtoClass: new () => any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Створити екземпляр DTO з body
      const dto = plainToClass(DtoClass, req.body);

      // Валідувати з опціями
      await validateOrReject(dto, {
        whitelist: true, // Видаляти властивості які не є в DTO
        forbidNonWhitelisted: true, // Кидали помилку якщо є зайві властивості
        validationError: {
          target: false,
          value: false,
        },
      });

      // Оновити body валідованим DTO
      req.body = dto;
      next();
    } catch (errors: any) {
      // Форматувати помилки валідації
      const formattedErrors = formatValidationErrors(errors as ValidationError[]);

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: formattedErrors,
        },
      });
    }
  };
};

/**
 * Форматування помилок валідації
 */
function formatValidationErrors(errors: ValidationError[]): any {
  return errors.map((error) => ({
    property: error.property,
    constraints: error.constraints,
    children: error.children?.map((child) => formatValidationErrors([child])),
  }));
}

/**
 * Middleware для валідації query параметрів
 */
export const validateQuery = (DtoClass: new () => any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(DtoClass, req.query);
      await validateOrReject(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      req.query = dto as any;
      next();
    } catch (errors: any) {
      const formattedErrors = formatValidationErrors(errors as ValidationError[]);
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query validation failed',
          details: formattedErrors,
        },
      });
    }
  };
};

/**
 * Middleware для валідації params
 */
export const validateParams = (DtoClass: new () => any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(DtoClass, req.params);
      await validateOrReject(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      req.params = dto as any;
      next();
    } catch (errors: any) {
      const formattedErrors = formatValidationErrors(errors as ValidationError[]);
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Params validation failed',
          details: formattedErrors,
        },
      });
    }
  };
};

export default validateRequest;
