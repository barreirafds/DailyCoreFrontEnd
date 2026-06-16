import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topbar">
        <NavLink to="/" className="brand">
          DailyCore
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Dashboard
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Profile
          </NavLink>
          <button type="button" className="link-button" onClick={logout}>
            Log out
          </button>
        </nav>
        <span className="user-badge">{user?.name}</span>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
