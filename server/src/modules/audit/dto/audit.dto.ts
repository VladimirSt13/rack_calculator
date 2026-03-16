import { IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId, IsObject } from 'class-validator';

/**
 * Типи дій аудиту
 */
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
}

/**
 * Типи сутностей аудиту
 */
export enum AuditEntityType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  PRICE = 'price',
  RACK_SET = 'rack_set',
  RACK_CONFIGURATION = 'rack_configuration',
  CALCULATION = 'calculation',
  EXPORT = 'export',
}

/**
 * DTO для запиту аудиту
 */
export class AuditQueryDto {
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType;

  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

/**
 * DTO для створення запису аудиту
 */
export class CreateAuditLogDto {
  @IsEnum(AuditAction)
  @IsNotEmpty({ message: 'Action is required' })
  action: AuditAction;

  @IsEnum(AuditEntityType)
  @IsNotEmpty({ message: 'Entity type is required' })
  entityType: AuditEntityType;

  @IsMongoId()
  @IsNotEmpty({ message: 'Entity ID is required' })
  entityId: string;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsString()
  @IsOptional()
  description?: string;
}
