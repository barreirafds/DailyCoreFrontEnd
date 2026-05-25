import { request } from './api/client';

export { register, login, getMe } from './api/auth';

export function getRoutines() {
  return request('/routines');
}

export function getRoutine(id) {
  return request(`/routines/${id}`);
}

export function createRoutine(routine) {
  return request('/routines', {
    method: 'POST',
    body: JSON.stringify(routine),
  });
}

export function updateRoutine(id, routine) {
  return request(`/routines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(routine),
  });
}

export function deleteRoutine(id) {
  return request(`/routines/${id}`, { method: 'DELETE' });
}

export function createTask(routineId, task) {
  return request(`/routines/${routineId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export function updateTask(taskId, task) {
  return request(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  });
}

export function completeTask(taskId) {
  return request(`/tasks/${taskId}/complete`, { method: 'PATCH' });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, { method: 'DELETE' });
}
