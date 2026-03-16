/**
 * DTO для публічної інформації про користувача
 */
export class UserResponseDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: {
    id: string;
    name: string;
  } | null;
  emailVerified: boolean;
  createdAt: Date;
  deleted?: boolean;
}

/**
 * DTO для списку користувачів з пагінацією
 */
export class UsersListDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
