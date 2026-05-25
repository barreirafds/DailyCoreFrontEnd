import { useState } from 'react';
import { completeTask, deleteTask } from '../api';

export default function TaskList({ tasks, onChanged }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  async function handleToggle(task) {
    setBusyId(task.id);
    setError(null);
    try {
      await completeTask(task.id);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(taskId) {
    setBusyId(taskId);
    setError(null);
    try {
      await deleteTask(taskId);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (!tasks?.length) {
    return <p className="muted">No tasks yet.</p>;
  }

  return (
    <div className="task-list">
      {error && <p className="message error">{error}</p>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <label>
              <input
                type="checkbox"
                checked={Boolean(task.completed)}
                disabled={busyId === task.id}
                onChange={() => handleToggle(task)}
              />
              <span>{task.title}</span>
            </label>
            <button
              type="button"
              className="danger small"
              disabled={busyId === task.id}
              onClick={() => handleDelete(task.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
