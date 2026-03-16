import { Request, Response, NextFunction } from 'express';

/**
 * Тип для асинхронного обробника запитів Express
 */
export type AsyncHandlerType = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

/**
 * Wrapper для асинхронних обробників
 * Перехоплює помилки та передає їх в next()
 * 
 * @param fn - Асинхронна функція обробника
 * @returns Функція обробника з обробкою помилок
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (fn: AsyncHandlerType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Async handler з автоматичною передачею контексту
 */
export const catchAsync = <T extends AsyncHandlerType>(fn: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
