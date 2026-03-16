import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty, IsMongoId } from 'class-validator';

/**
 * DTO для створення користувача
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid role ID' })
  roleId?: string;
}

/**
 * DTO для оновлення користувача
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid role ID' })
  roleId?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  currentPassword?: string;
}

/**
 * DTO для зміни пароля
 */
export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Current password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}
