/**
 * DTO для відповіді прайсу
 */
export class PriceResponseDto {
  id: string;
  data: any;
  category?: string;
  updatedAt: Date;
}

/**
 * DTO для компонента прайсу
 */
export class PriceComponentResponseDto {
  id: string;
  name: string;
  category: string;
  price: number;
  unit?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO для списку компонентів прайсу
 */
export class PriceComponentsListDto {
  components: PriceComponentResponseDto[];
  total: number;
}

/**
 * DTO для категорій прайсів
 */
export class PriceCategoryDto {
  name: string;
  count: number;
}
