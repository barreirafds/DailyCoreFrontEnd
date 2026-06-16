import { request } from './client';
import type {
  CreateRoutineRequest,
  Routine,
  UpdateRoutineRequest,
} from '../types/api';

export function getRoutines(): Promise<Routine[]> {
  return request<Routine[]>('/routines');
}

export function getRoutine(id: number): Promise<Routine> {
  return request<Routine>(`/routines/${id}`);
}

export function createRoutine(data: CreateRoutineRequest): Promise<Routine> {
  return request<Routine>('/routines', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateRoutine(id: number, data: UpdateRoutineRequest): Promise<Routine> {
  return request<Routine>(`/routines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteRoutine(id: number): Promise<void> {
  return request<void>(`/routines/${id}`, { method: 'DELETE' });
}
