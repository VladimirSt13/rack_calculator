import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';

/**
 * Тип розрахунку
 */
export enum CalculationType {
  RACK = 'rack',
  BATTERY = 'battery',
}

/**
 * DTO для створення розрахунку
 */
export class CreateCalculationDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEnum(CalculationType, { message: 'Invalid calculation type' })
  @IsNotEmpty({ message: 'Type is required' })
  type: CalculationType;

  @IsObject()
  @IsNotEmpty({ message: 'Calculation data is required' })
  data: any;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO для оновлення розрахунку
 */
export class UpdateCalculationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsString()
  description?: string;
}
