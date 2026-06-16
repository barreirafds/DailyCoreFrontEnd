import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, login as apiLogin, register as apiRegister, updateMe } from '../api/auth';
import { setOnUnauthorized } from '../api/client';
import { clearSession, getStoredUser, getToken, setSession } from '../auth/storage';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '../types/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  updateProfile: (data: UpdateProfileRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getToken());
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
      if (storedUser) setUser(storedUser);

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

    void restoreSession();
  }, []);

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    setSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await apiLogin(credentials);
      applyAuthResponse(response);
      navigate('/', { replace: true });
      return response;
    },
    [applyAuthResponse, navigate],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const response = await apiRegister(data);
      applyAuthResponse(response);
      navigate('/', { replace: true });
      return response;
    },
    [applyAuthResponse, navigate],
  );

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    const updated = await updateMe(data);
    const currentToken = getToken();
    if (currentToken) setSession(currentToken, updated);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      updateProfile,
      logout,
    }),
    [user, token, loading, login, register, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
