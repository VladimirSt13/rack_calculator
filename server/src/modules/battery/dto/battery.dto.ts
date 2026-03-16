import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для розмірів акумулятора
 */
export class BatteryDimensionsDto {
  @IsNumber()
  @Min(0.1, { message: 'Length must be at least 0.1' })
  length: number;

  @IsNumber()
  @Min(0.1, { message: 'Width must be at least 0.1' })
  width: number;

  @IsNumber()
  @Min(0.1, { message: 'Height must be at least 0.1' })
  height: number;

  @IsNumber()
  @Min(0, { message: 'Weight cannot be negative' })
  weight?: number;
}

/**
 * DTO для параметрів розрахунку
 */
export class BatteryCalculationDto {
  @IsString()
  @IsNotEmpty({ message: 'Battery model is required' })
  batteryModel: string;

  @IsObject()
  @Type(() => BatteryDimensionsDto)
  dimensions: BatteryDimensionsDto;

  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsNumber()
  @Min(0, { message: 'Gap cannot be negative' })
  gap?: number;

  @IsOptional()
  @IsString()
  orientation?: 'lengthwise' | 'widthwise';
}

/**
 * DTO для результату розрахунку
 */
export class BatteryRackCalculationDto {
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
}
