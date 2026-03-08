/**
 * Типи для feature: auth
 */

// ===== User Types =====

export type UserRole = 'admin' | 'manager' | 'user' | 'other';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  permissions?: UserPermissions;
  companyDomain?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Permissions Types =====

export interface UserPermissions {
  show_retail?: boolean;
  show_wholesale?: boolean;
  show_zero?: boolean;
  show_no_isolators?: boolean;
  show_cost_price?: boolean;
  show_all?: boolean;
}

export interface RolePermissions {
  name: string;
  description?: string;
  permissions: UserPermissions;
  priceTypes?: string[];
}

// ===== Auth Types =====

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

export interface VerifyEmailData {
  email: string;
  token: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ===== Auth Store Types =====

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  verifyEmail: (data: VerifyEmailData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
}

// ===== Form Types =====

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
