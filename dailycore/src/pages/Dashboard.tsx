import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { friendlyError } from '../api/errors';
import { deleteRoutine, getRoutines } from '../api/routines';
import ErrorAlert from '../components/ErrorAlert';
import LoadingMessage from '../components/LoadingMessage';
import type { Routine } from '../types/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function taskProgress(tasks: Routine['tasks']): string {
  const done = tasks.filter((t) => t.completed).length;
  return `${done}/${tasks.length} done`;
}

export default function Dashboard() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoutines();
      setRoutines(data);
    } catch (err) {
      setError(friendlyError(err));
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(routine: Routine) {
    if (!window.confirm(`Delete routine "${routine.title}" and all its tasks?`)) return;

    setDeletingId(routine.id);
    setError(null);
    try {
      await deleteRoutine(routine.id);
      await load();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My routines</h1>
          <p className="subtitle">Your daily habits in one place</p>
        </div>
        <Link to="/routines/new" className="button">
          New routine
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingMessage text="Loading routines..." />
      ) : routines.length === 0 ? (
        <div className="card empty-state">
          <p>No routines yet.</p>
          <Link to="/routines/new">Create your first routine</Link>
        </div>
      ) : (
        <ul className="routine-grid">
          {routines.map((routine) => (
            <li key={routine.id} className="card routine-card">
              <Link to={`/routines/${routine.id}`} className="routine-link">
                <h2>{routine.title}</h2>
                {routine.description && <p>{routine.description}</p>}
                <div className="meta">
                  <span>{formatDate(routine.createdAt)}</span>
                  <span>{taskProgress(routine.tasks)}</span>
                </div>
              </Link>
              <div className="card-actions">
                <Link to={`/routines/${routine.id}/edit`} className="button secondary small">
                  Edit
                </Link>
                <button
                  type="button"
                  className="danger small"
                  disabled={deletingId === routine.id}
                  onClick={() => void handleDelete(routine)}
                >
                  {deletingId === routine.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
