import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject } from 'class-validator';

/**
 * DTO для створення прайсу
 */
export class CreatePriceDto {
  @IsObject()
  @IsNotEmpty({ message: 'Price data is required' })
  data: any;

  @IsOptional()
  @IsString()
  category?: string;
}

/**
 * DTO для оновлення прайсу
 */
export class UpdatePriceDto {
  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsString()
  category?: string;
}

/**
 * DTO для компонента прайсу
 */
export class PriceComponentDto {
  @IsString()
  @IsNotEmpty({ message: 'Component name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

/**
 * DTO для створення компонента прайсу
 */
export class CreatePriceComponentDto {
  @IsString()
  @IsNotEmpty({ message: 'Component name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

/**
 * DTO для оновлення компонента прайсу
 */
export class UpdatePriceComponentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
