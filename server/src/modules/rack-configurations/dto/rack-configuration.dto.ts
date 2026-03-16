import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для компонента конфігурації стелажа
 */
export class RackComponentDto {
  @IsString()
  @IsNotEmpty({ message: 'Component type is required' })
  type: string;

  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  price?: number;
}

/**
 * DTO для створення конфігурації стелажа
 */
export class CreateRackConfigurationDto {
  @IsString()
  @IsNotEmpty({ message: 'Configuration name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Type is required' })
  type: string;

  @IsNumber()
  @Min(1, { message: 'Rows must be at least 1' })
  rows: number;

  @IsNumber()
  @Min(1, { message: 'Columns must be at least 1' })
  columns: number;

  @IsNumber()
  @Min(1, { message: 'Levels must be at least 1' })
  levels: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  braceCount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RackComponentDto)
  components: RackComponentDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: any;
}

/**
 * DTO для оновлення конфігурації стелажа
 */
export class UpdateRackConfigurationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rows?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  columns?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  levels?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  braceCount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RackComponentDto)
  components?: RackComponentDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: any;
}
