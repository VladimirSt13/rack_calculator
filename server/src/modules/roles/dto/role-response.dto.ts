/**
 * DTO для відповіді ролі
 */
export class RoleResponseDto {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionDto[];
  createdAt: Date;
  deleted?: boolean;
}

/**
 * DTO для дозволу
 */
export class PermissionDto {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

/**
 * DTO для списку ролей
 */
export class RolesListDto {
  roles: RoleResponseDto[];
  total: number;
}

/**
 * DTO для списку дозволів
 */
export class PermissionsListDto {
  permissions: PermissionDto[];
  total: number;
}
