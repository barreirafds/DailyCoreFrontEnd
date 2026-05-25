import { useState } from 'react';
import { createTask } from '../api';

export default function TaskForm({ routineId, onSaved }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTask(routineId, { title: title.trim() });
      setTitle('');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error && <p className="message error">{error}</p>}
      <label>
        Add task
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add task'}
      </button>
    </form>
  );
}
