import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, login as apiLogin, register as apiRegister } from '../api/auth';
import { setOnUnauthorized } from '../api/client';
import { clearSession, getStoredUser, getToken, setSession } from '../auth/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  useEffect(() => {
    async function restoreSession() {
      const storedToken = getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const me = await getMe();
        setUser(me);
        setSession(storedToken, me);
      } catch {
        clearSession();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const applyAuthResponse = useCallback((response) => {
    setSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await apiLogin(credentials);
      applyAuthResponse(response);
      navigate('/', { replace: true });
      return response;
    },
    [applyAuthResponse, navigate],
  );

  const register = useCallback(
    async (data) => {
      const response = await apiRegister(data);
      applyAuthResponse(response);
      navigate('/', { replace: true });
      return response;
    },
    [applyAuthResponse, navigate],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
