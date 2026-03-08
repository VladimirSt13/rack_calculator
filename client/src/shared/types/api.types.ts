/**
 * Спільні API типи
 */

// ===== Generic API Response Types =====

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status?: number;
}

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== Query Types =====

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, unknown>;
  search?: string;
}

// ===== Auth API Types =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// ===== User API Types =====

export interface UserDto {
  id: number;
  email: string;
  role: string;
  permissions?: Record<string, boolean>;
  companyDomain?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: string;
  permissions?: Record<string, boolean>;
}

export interface UpdateUserRequest {
  id: number;
  email?: string;
  password?: string;
  role?: string;
  permissions?: Record<string, boolean>;
}

// ===== Role API Types =====

export interface RoleDto {
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
  priceTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRolePermissionsRequest {
  permissions: Record<string, boolean>;
}

export interface UpdateRolePriceTypesRequest {
  priceTypes: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
  priceTypes: string[];
}

// ===== Price API Types =====

export interface PriceDto {
  id: number;
  version: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PriceComponentsDto {
  supports: Record<string, { edge: { price: number }; intermediate: { price: number } }>;
  spans: Record<string, { price: number }>;
  vertical_supports: Record<string, { price: number }>;
  diagonal_brace: Record<string, { price: number }>;
  isolator: Record<string, { price: number }>;
}

export interface UpdatePriceRequest {
  version: string;
  data: Record<string, unknown>;
}

// ===== Rack Calculation Types =====

export interface RackCalculationRequest {
  floors: number;
  rows: number;
  beamsPerRow: number;
  supports?: string;
  verticalSupports?: string;
  spansArray?: number[];
}

export interface RackCalculationResponse {
  name: string;
  components: Record<string, unknown>;
  totalCost: number;
  totalWithoutIsolators: number;
  zeroPrice?: number;
}

// ===== Battery Calculation Types =====

export interface BatteryCalculationRequest {
  batteryDimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  quantity: number;
  format?: string;
}

export interface BatteryVariantDto {
  id: string;
  name: string;
  rackLength: number;
  batteriesPerRow: number;
  rows: number;
  totalBatteries: number;
  config: {
    floors: number;
    rows: number;
    beamsPerRow: number;
    spansArray: number[];
  };
  components: Array<{
    name: string;
    amount: number;
    price: number;
    total: number;
  }>;
  prices?: Array<{
    type: string;
    amount: number;
    label: string;
  }>;
  totalCost?: number;
}

export interface BatteryCalculationResponse {
  variants: BatteryVariantDto[];
  bestMatch?: {
    variant: BatteryVariantDto;
    score: number;
    reasons: string[];
  };
  recommendedFormat?: string;
}

// ===== Rack Set Types =====

export interface RackSetDto {
  id: number;
  userId: number;
  name: string;
  objectName?: string;
  description?: string;
  racks: BatteryVariantDto[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRackSetRequest {
  name: string;
  objectName?: string;
  description?: string;
  racks: BatteryVariantDto[];
}

export interface UpdateRackSetRequest {
  id: number;
  name?: string;
  objectName?: string;
  description?: string;
  racks?: BatteryVariantDto[];
}

// ===== Audit Types =====

export interface AuditLogDto {
  id: number;
  userId: number | null;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: number | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditCleanupRequest {
  days: number;
}

export interface AuditStats {
  totalRecords: number;
  recordsOlderThan30Days: number;
  recordsOlderThan90Days: number;
  oldestRecord: string;
  newestRecord: string;
  actionsBreakdown: Record<string, number>;
  entitiesBreakdown: Record<string, number>;
}

// ===== Export Types =====

export interface ExportRequest {
  setId: number;
  includePrices?: boolean;
  format?: 'excel' | 'pdf' | 'csv';
}

export interface ExportResponse {
  url: string;
  filename: string;
  expiresAt: string;
}
