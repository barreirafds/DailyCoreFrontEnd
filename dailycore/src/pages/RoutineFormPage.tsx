import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { friendlyError } from '../api/errors';
import { createRoutine, getRoutine, updateRoutine } from '../api/routines';
import ErrorAlert from '../components/ErrorAlert';
import LoadingMessage from '../components/LoadingMessage';
import { validateTitle } from '../utils/validation';

export default function RoutineFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const routineId = id ? Number(id) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || !routineId || Number.isNaN(routineId)) return;

    const idToLoad = routineId;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const routine = await getRoutine(idToLoad);
        setTitle(routine.title);
        setDescription(routine.description ?? '');
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [isEditing, routineId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const titleError = validateTitle(title);
    setFieldError(titleError);
    if (titleError) return;

    setSaving(true);
    setError(null);
    const payload = {
      title: title.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
    };

    try {
      if (isEditing && routineId) {
        await updateRoutine(routineId, payload);
        navigate(`/routines/${routineId}`, { replace: true });
      } else {
        const created = await createRoutine(payload);
        navigate(`/routines/${created.id}`, { replace: true });
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingMessage text="Loading routine..." />;

  return (
    <div className="page">
      <Link to={isEditing && routineId ? `/routines/${routineId}` : '/'} className="back-link">
        ← Cancel
      </Link>

      <div className="card form-card">
        <h1>{isEditing ? 'Edit routine' : 'New routine'}</h1>
        {error && <ErrorAlert message={error} />}
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
            />
            {fieldError && <span className="field-error">{fieldError}</span>}
          </label>
          <label>
            Description <span className="optional">(optional)</span>
            <textarea
              value={description}
              rows={4}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update routine' : 'Create routine'}
            </button>
            <Link
              to={isEditing && routineId ? `/routines/${routineId}` : '/'}
              className="button secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
