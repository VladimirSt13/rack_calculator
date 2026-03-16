import { IsString, IsNotEmpty, IsOptional, IsArray, IsMongoId } from 'class-validator';

/**
 * DTO для створення ролі
 */
export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Invalid permission ID' })
  permissionIds?: string[];
}

/**
 * DTO для оновлення ролі
 */
export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Invalid permission ID' })
  permissionIds?: string[];
}

/**
 * DTO для призначення дозволів ролі
 */
export class AssignPermissionsDto {
  @IsArray()
  @IsMongoId({ each: true, message: 'Invalid permission ID' })
  @IsNotEmpty({ message: 'At least one permission is required' })
  permissionIds: string[];
}

/**
 * DTO для створення дозволу
 */
export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty({ message: 'Permission name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Resource is required' })
  resource: string;

  @IsString()
  @IsNotEmpty({ message: 'Action is required' })
  action: string;
}
