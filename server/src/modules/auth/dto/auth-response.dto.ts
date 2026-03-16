/**
 * DTO для токенів
 */
export class AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * DTO для публічної інформації про користувача
 */
export class UserPublicDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions: string[];
  emailVerified: boolean;
  createdAt?: Date;
}

/**
 * DTO для відповіді авторизації
 */
export class AuthResponseDto {
  user: UserPublicDto;
  tokens: AuthTokensDto;
}

/**
 * DTO для відповіді при зміні пароля
 */
export class ChangePasswordResponseDto {
  message: string;
  success: boolean;
}
