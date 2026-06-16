export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Invalid email or password.';
      case 404:
        return 'The requested item was not found.';
      case 409:
        return 'This email is already registered. Try signing in instead.';
      case 400:
        if (/email/i.test(error.message)) return 'Please enter a valid email address.';
        if (/password/i.test(error.message)) return 'Password must be at least 6 characters.';
        return error.message;
      default:
        return error.message;
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
