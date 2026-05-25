import { useState } from 'react';
import { deleteRoutine } from '../api';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

export default function RoutineList({ routines, onEdit, onChanged }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  async function handleDelete(routineId) {
    if (!window.confirm('Delete this routine and all its tasks?')) {
      return;
    }

    setBusyId(routineId);
    setError(null);
    try {
      await deleteRoutine(routineId);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (!routines.length) {
    return <p className="muted">No routines yet. Create one above.</p>;
  }

  return (
    <div className="routine-list">
      {error && <p className="message error">{error}</p>}
      {routines.map((routine) => (
        <article key={routine.id} className="card routine-card">
          <header className="routine-header">
            <div>
              <h2>{routine.title}</h2>
              {routine.description && <p>{routine.description}</p>}
            </div>
            <div className="routine-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => onEdit(routine)}
              >
                Edit
              </button>
              <button
                type="button"
                className="danger"
                disabled={busyId === routine.id}
                onClick={() => handleDelete(routine.id)}
              >
                {busyId === routine.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </header>

          <section className="tasks-section">
            <h3>Tasks</h3>
            <TaskList tasks={routine.tasks} onChanged={onChanged} />
            <TaskForm routineId={routine.id} onSaved={onChanged} />
          </section>
        </article>
      ))}
    </div>
  );
}
