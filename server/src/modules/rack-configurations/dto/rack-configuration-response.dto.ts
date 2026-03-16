/**
 * DTO для відповіді конфігурації стелажа
 */
export class RackConfigurationResponseDto {
  id: string;
  name: string;
  type: string;
  rows: number;
  columns: number;
  levels: number;
  braceCount?: number;
  components: RackComponentDto[];
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO для компонента конфігурації
 */
export class RackComponentDto {
  type: string;
  quantity: number;
  description?: string;
  price?: number;
}

/**
 * DTO для списку конфігурацій
 */
export class RackConfigurationsListDto {
  configurations: RackConfigurationResponseDto[];
  total: number;
}
