import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoutines } from '../api';
import RoutineForm from '../components/RoutineForm';
import RoutineList from '../components/RoutineList';

export default function Home() {
  const { user, logout } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoutine, setEditingRoutine] = useState(null);

  const loadRoutines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoutines();
      setRoutines(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  function handleRoutineSaved() {
    setEditingRoutine(null);
    loadRoutines();
  }

  return (
    <div className="app">
      <header className="app-header app-header-bar">
        <div>
          <h1>DailyCore</h1>
          <p>Hello, {user?.name}</p>
        </div>
        <button type="button" className="secondary" onClick={logout}>
          Log out
        </button>
      </header>

      {error && !loading && (
        <p className="message error banner">Could not load routines: {error}</p>
      )}

      <RoutineForm
        routine={editingRoutine}
        onSaved={handleRoutineSaved}
        onCancel={() => setEditingRoutine(null)}
      />

      {loading ? (
        <p className="message loading">Loading routines...</p>
      ) : (
        <RoutineList
          routines={routines}
          onEdit={setEditingRoutine}
          onChanged={loadRoutines}
        />
      )}
    </div>
  );
}
