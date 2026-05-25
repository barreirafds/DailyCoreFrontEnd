import { useEffect, useState } from 'react';
import { createRoutine, updateRoutine } from '../api';

export default function RoutineForm({ routine, onSaved, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = Boolean(routine);

  useEffect(() => {
    setTitle(routine?.title ?? '');
    setDescription(routine?.description ?? '');
    setError(null);
  }, [routine]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { title: title.trim(), description: description.trim() };
      if (isEditing) {
        await updateRoutine(routine.id, payload);
      } else {
        await createRoutine(payload);
      }
      setTitle('');
      setDescription('');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit routine' : 'New routine'}</h2>
      {error && <p className="message error">{error}</p>}
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </label>
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update routine' : 'Create routine'}
        </button>
        {isEditing && (
          <button type="button" className="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
