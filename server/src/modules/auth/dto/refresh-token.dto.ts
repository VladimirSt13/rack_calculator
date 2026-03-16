import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO для оновлення токену
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}
