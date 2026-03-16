import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto';

/**
 * Users Controller
 * Обробка HTTP запитів для управління користувачами
 */
export class UsersController {
  private usersService: UsersService;

  constructor(usersService: UsersService) {
    this.usersService = usersService;
  }

  /**
   * Отримати список користувачів
   * GET /api/users
   */
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const {
      search,
      roleId,
      emailVerified,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const result = await this.usersService.getUsers({
      search: search as string,
      roleId: roleId as string,
      emailVerified: emailVerified === 'true' || emailVerified === 'false' ? emailVerified === 'true' : undefined,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    ApiResponder.success(res, result);
  });

  /**
   * Отримати користувача за ID
   * GET /api/users/:id
   */
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.usersService.getUserById(id);
    ApiResponder.success(res, result);
  });

  /**
   * Отримати статистику користувачів
   * GET /api/users/stats
   */
  getUsersStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.usersService.getUsersStats();
    ApiResponder.success(res, stats);
  });

  /**
   * Створити нового користувача
   * POST /api/users
   */
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateUserDto = req.body;
    const result = await this.usersService.createUser(dto);
    ApiResponder.created(res, result);
  });

  /**
   * Оновити користувача
   * PATCH /api/users/:id
   */
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: UpdateUserDto = req.body;
    const result = await this.usersService.updateUser(id, dto);
    ApiResponder.success(res, result);
  });

  /**
   * Змінити пароль
   * POST /api/users/:id/change-password
   */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: ChangePasswordDto = req.body;
    await this.usersService.changePassword({
      userId: id,
      ...dto,
    });
    ApiResponder.success(res, { message: 'Password changed successfully' });
  });

  /**
   * Видалити користувача
   * DELETE /api/users/:id
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.usersService.deleteUser(id);
    ApiResponder.success(res, { message: 'User deleted successfully' });
  });

  /**
   * Відновити користувача
   * POST /api/users/:id/restore
   */
  restoreUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.usersService.restoreUser(id);
    ApiResponder.success(res, result);
  });

  /**
   * Отримати поточного користувача
   * GET /api/users/me
   */
  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const result = await this.usersService.getUserById(req.user.userId);
    ApiResponder.success(res, result);
  });

  /**
   * Оновити поточного користувача
   * PATCH /api/users/me
   */
  updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const dto: UpdateUserDto = req.body;
    const result = await this.usersService.updateUser(req.user.userId, dto);
    ApiResponder.success(res, result);
  });
}

export default UsersController;
