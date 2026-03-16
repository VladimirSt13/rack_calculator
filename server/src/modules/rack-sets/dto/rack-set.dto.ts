import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для елемента стелажа в комплекті
 */
export class RackItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Configuration ID is required' })
  configurationId: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

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

  @IsOptional()
  @IsArray()
  components?: any[];
}

/**
 * DTO для створення комплекту стелажів
 */
export class CreateRackSetDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RackItemDto)
  racks: RackItemDto[];
}

/**
 * DTO для оновлення комплекту стелажів
 */
export class UpdateRackSetDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RackItemDto)
  racks?: RackItemDto[];
}
