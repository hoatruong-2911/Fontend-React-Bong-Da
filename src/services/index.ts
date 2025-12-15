// API instance
export { default as api } from './api';

// Auth service (dùng chung)
export { default as authService } from './authService';
export type { LoginCredentials, RegisterData, User, AuthResponse } from './authService';

// Customer services
export * as customerServices from './customer';

// Staff services
export * as staffServices from './staff';

// Admin services
export * as adminServices from './admin';
