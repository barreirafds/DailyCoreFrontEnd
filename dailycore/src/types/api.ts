export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
}

export interface AuthResponse {
  token: string;
  type: 'Bearer';
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  phoneNumber?: string;
}

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export interface Routine {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  tasks: Task[];
}

export interface CreateRoutineRequest {
  title: string;
  description?: string;
}

export interface UpdateRoutineRequest {
  title: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;
}

export interface UpdateTaskRequest {
  title: string;
  completed: boolean;
}

export interface CompleteTaskRequest {
  completed: boolean;
}

export interface ApiErrorBody {
  error: string;
}
