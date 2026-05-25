import { useCallback, useEffect, useState } from 'react';
import { getRoutines } from './api';
import RoutineForm from './components/RoutineForm';
import RoutineList from './components/RoutineList';
import './App.css';

export default function App() {
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
      <header className="app-header">
        <h1>DailyCore</h1>
        <p>Manage your daily routines and tasks</p>
      </header>

      {error && !loading && (
        <p className="message error banner">
          Could not load routines: {error}. Is the API running on port 8080?
        </p>
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
