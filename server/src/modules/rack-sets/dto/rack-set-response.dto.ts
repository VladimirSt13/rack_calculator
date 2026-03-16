/**
 * DTO для відповіді комплекту стелажів
 */
export class RackSetResponseDto {
  id: string;
  name: string;
  description?: string;
  user: {
    id: string;
    email: string;
  };
  currentRevision: number;
  racks: RackItemDto[];
  deleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO для елемента стелажа
 */
export class RackItemDto {
  id?: string;
  configurationId: string;
  name: string;
  rows: number;
  columns: number;
  levels: number;
  braceCount?: number;
  components?: any[];
}

/**
 * DTO для ревізії комплекту
 */
export class RackSetRevisionDto {
  id: string;
  revisionNumber: number;
  racks: RackItemDto[];
  createdAt: Date;
  createdBy: {
    id: string;
    email: string;
  };
}

/**
 * DTO для списку комплектів
 */
export class RackSetsListDto {
  rackSets: RackSetResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
