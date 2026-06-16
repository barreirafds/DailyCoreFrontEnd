import { useEffect, useState } from 'react';
import { friendlyError } from '../api/errors';
import { getMe } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';
import LoadingMessage from '../components/LoadingMessage';
import { validateEmail, validateName } from '../utils/validation';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const me = await getMe();
        setName(me.name);
        setEmail(me.email);
        setPhoneNumber(me.phoneNumber ?? '');
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
    };
    setFieldErrors(errors);
    if (errors.name || errors.email) return;

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        ...(phoneNumber.trim() ? { phoneNumber: phoneNumber.trim() } : {}),
      });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingMessage text="Loading profile..." />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="subtitle">Manage your account details</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}
      {success && <p className="message success">{success}</p>}

      <div className="card form-card">
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </label>
          <label>
            Phone <span className="optional">(optional)</span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={saving}
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="secondary" onClick={logout}>
              Log out
            </button>
          </div>
        </form>
        {user && (
          <p className="meta-text profile-id">Account ID: {user.id}</p>
        )}
      </div>
    </div>
  );
}
