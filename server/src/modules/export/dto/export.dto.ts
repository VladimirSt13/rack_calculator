import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsBoolean } from 'class-validator';

/**
 * DTO для експорту комплекту стелажів
 */
export class ExportRackSetDto {
  @IsMongoId({ message: 'Invalid rack set ID' })
  @IsNotEmpty({ message: 'Rack set ID is required' })
  rackSetId: string;

  @IsOptional()
  @IsBoolean()
  includePrices?: boolean;

  @IsOptional()
  @IsBoolean()
  includeComponents?: boolean;
}

/**
 * DTO для експорту прайсу
 */
export class ExportPriceDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  includeComponents?: boolean;
}

/**
 * DTO для експорту розрахунку
 */
export class ExportCalculationDto {
  @IsMongoId({ message: 'Invalid calculation ID' })
  @IsNotEmpty({ message: 'Calculation ID is required' })
  calculationId: string;

  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean;
}
