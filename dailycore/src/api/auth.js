import { request } from './client';

export function register(data) {
  return request('/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(data),
  });
}

export function login(data) {
  return request('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(data),
  });
}

export function getMe() {
  return request('/auth/me');
}
