import { request } from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '../types/api';

export function register(data: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(data),
  });
}

export function login(data: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(data),
  });
}

export function getMe(): Promise<User> {
  return request<User>('/auth/me');
}

export function updateMe(data: UpdateProfileRequest): Promise<User> {
  return request<User>('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
