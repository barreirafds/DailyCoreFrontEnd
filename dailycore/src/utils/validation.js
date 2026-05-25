const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validateName(name) {
  if (!name.trim()) return 'Name is required.';
  return null;
}

export function friendlyAuthError(err) {
  const message = err?.message || 'Something went wrong. Please try again.';
  const status = err?.status;

  if (status === 401) {
    return 'Invalid email or password.';
  }
  if (status === 409) {
    return 'This email is already registered. Try signing in instead.';
  }
  if (status === 400) {
    if (/email/i.test(message)) return 'Please enter a valid email address.';
    if (/password/i.test(message)) return 'Password must be at least 6 characters.';
    return message;
  }

  return message;
}
