import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { friendlyError } from '../api/errors';
import { deleteRoutine, getRoutine } from '../api/routines';
import {
  completeTask,
  createTask,
  deleteTask,
  updateTask,
} from '../api/tasks';
import ErrorAlert from '../components/ErrorAlert';
import LoadingMessage from '../components/LoadingMessage';
import type { Routine, Task } from '../types/api';
import { validateTitle } from '../utils/validation';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function RoutineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routineId = Number(id);

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingRoutine, setDeletingRoutine] = useState(false);

  async function load() {
    if (!routineId || Number.isNaN(routineId)) {
      setError('Invalid routine.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getRoutine(routineId);
      setRoutine(data);
    } catch (err) {
      setError(friendlyError(err));
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);

  async function handleAddTask(event: React.FormEvent) {
    event.preventDefault();
    const titleError = validateTitle(newTaskTitle);
    if (titleError) {
      setError(titleError);
      return;
    }

    setAddingTask(true);
    setError(null);
    try {
      await createTask(routineId, { title: newTaskTitle.trim() });
      setNewTaskTitle('');
      await load();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setAddingTask(false);
    }
  }

  async function handleToggle(task: Task) {
    setBusyTaskId(task.id);
    setError(null);
    try {
      await completeTask(task.id, { completed: !task.completed });
      await load();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;

    setBusyTaskId(task.id);
    setError(null);
    try {
      await deleteTask(task.id);
      await load();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusyTaskId(null);
    }
  }

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  }

  async function handleSaveEdit(task: Task) {
    const titleError = validateTitle(editTitle);
    if (titleError) {
      setError(titleError);
      return;
    }

    setBusyTaskId(task.id);
    setError(null);
    try {
      await updateTask(task.id, { title: editTitle.trim(), completed: task.completed });
      setEditingTaskId(null);
      await load();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleDeleteRoutine() {
    if (!routine) return;
    if (!window.confirm(`Delete routine "${routine.title}" and all its tasks?`)) return;

    setDeletingRoutine(true);
    setError(null);
    try {
      await deleteRoutine(routine.id);
      navigate('/', { replace: true });
    } catch (err) {
      setError(friendlyError(err));
      setDeletingRoutine(false);
    }
  }

  if (loading) return <LoadingMessage text="Loading routine..." />;

  if (!routine) {
    return (
      <div className="page">
        {error && <ErrorAlert message={error} />}
        <Link to="/">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Back to dashboard
      </Link>

      <div className="page-header">
        <div>
          <h1>{routine.title}</h1>
          {routine.description && <p className="subtitle">{routine.description}</p>}
          <p className="meta-text">Created {formatDate(routine.createdAt)}</p>
        </div>
        <div className="header-actions">
          <Link to={`/routines/${routine.id}/edit`} className="button secondary">
            Edit routine
          </Link>
          <button
            type="button"
            className="danger"
            disabled={deletingRoutine}
            onClick={() => void handleDeleteRoutine()}
          >
            {deletingRoutine ? 'Deleting...' : 'Delete routine'}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <section className="card">
        <h2>Tasks</h2>
        {routine.tasks.length === 0 ? (
          <p className="muted">No tasks yet. Add one below.</p>
        ) : (
          <ul className="task-list">
            {routine.tasks.map((task) => (
              <li key={task.id} className={task.completed ? 'completed' : undefined}>
                {editingTaskId === task.id ? (
                  <div className="task-edit">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      disabled={busyTaskId === task.id}
                    />
                    <button
                      type="button"
                      disabled={busyTaskId === task.id}
                      onClick={() => void handleSaveEdit(task)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      disabled={busyTaskId === task.id}
                      onClick={() => setEditingTaskId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="task-check">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled={busyTaskId === task.id}
                        onChange={() => void handleToggle(task)}
                      />
                      <span>{task.title}</span>
                    </label>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="secondary small"
                        disabled={busyTaskId === task.id}
                        onClick={() => startEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger small"
                        disabled={busyTaskId === task.id}
                        onClick={() => void handleDeleteTask(task)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <form className="task-form" onSubmit={handleAddTask}>
          <label>
            New task
            <input
              type="text"
              value={newTaskTitle}
              placeholder="What do you need to do?"
              onChange={(e) => setNewTaskTitle(e.target.value)}
              disabled={addingTask}
            />
          </label>
          <button type="submit" disabled={addingTask}>
            {addingTask ? 'Adding...' : 'Add task'}
          </button>
        </form>
      </section>
    </div>
  );
}
