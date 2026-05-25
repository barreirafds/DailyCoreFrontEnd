import { clearSession, getToken } from '../auth/storage';

const API_BASE = 'http://localhost:8080/api';

let onUnauthorized = null;

export function setOnUnauthorized(handler) {
  onUnauthorized = handler;
}

async function parseError(response) {
  let message = response.statusText;
  try {
    const body = await response.json();
    message = body.error || body.message || message;
  } catch {
    // response may not be JSON
  }
  return message || `Request failed (${response.status})`;
}

/**
 * @param {string} path - path after /api (e.g. "/routines")
 * @param {RequestInit & { auth?: boolean }} options - auth: false skips Bearer header (login/register)
 */
export async function request(path, options = {}) {
  const { auth = true, headers: customHeaders, ...fetchOptions } = options;
  const headers = {
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
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    const message = await parseError(response);
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
