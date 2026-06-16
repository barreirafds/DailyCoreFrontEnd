import { clearSession, getToken } from '../auth/storage';
import { ApiError } from './errors';
import type { ApiErrorBody } from '../types/api';

const API_BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api`;

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setOnUnauthorized(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  auth?: boolean;
  headers?: Record<string, string>;
}

async function parseError(response: Response): Promise<string> {
  let message = response.statusText;
  try {
    const body = (await response.json()) as ApiErrorBody;
    message = body.error || message;
  } catch {
    // response may not be JSON
  }
  return message || `Request failed (${response.status})`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers: customHeaders, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && auth) {
    clearSession();
    onUnauthorized?.();
    throw new ApiError('Your session has expired. Please sign in again.', 401);
  }

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}
