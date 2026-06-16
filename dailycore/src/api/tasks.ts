import { request } from './client';
import type {
  CompleteTaskRequest,
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from '../types/api';

export function createTask(routineId: number, data: CreateTaskRequest): Promise<Task> {
  return request<Task>(`/routines/${routineId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTask(taskId: number, data: UpdateTaskRequest): Promise<Task> {
  return request<Task>(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function completeTask(taskId: number, data: CompleteTaskRequest): Promise<Task> {
  return request<Task>(`/tasks/${taskId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteTask(taskId: number): Promise<void> {
  return request<void>(`/tasks/${taskId}`, { method: 'DELETE' });
}
