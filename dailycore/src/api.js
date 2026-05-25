const API_BASE = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.message || body.error || JSON.stringify(body);
    } catch {
      // response may not be JSON
    }
    throw new Error(message || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

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
