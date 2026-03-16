/**
 * DTO для відповіді розрахунку
 */
export class CalculationResponseDto {
  id: string;
  name: string;
  type: string;
  data: any;
  description?: string;
  user: {
    id: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO для списку розрахунків
 */
export class CalculationsListDto {
  calculations: CalculationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
