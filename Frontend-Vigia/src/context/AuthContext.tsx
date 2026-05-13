import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/auth.service';
import { parseJwt, getRolFromJwt, isTokenExpiringSoon, type JwtPayload } from '../utils/jwt';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  sub: string;
  username: string;
  email: string;
  name: string;
  rol: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login:  (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_ACCESS  = 'kc-token';
const STORAGE_REFRESH = 'kc-refresh';
const STORAGE_ROLE    = 'kc-role';

function buildUser(payload: JwtPayload): AuthUser {
  return {
    sub:      payload.sub,
    username: payload.preferred_username ?? payload.email ?? payload.sub,
    email:    payload.email ?? '',
    name:     payload.name
                ?? ([payload.given_name, payload.family_name].filter(Boolean).join(' ')
                    || payload.preferred_username
                    || 'Usuario'),
    rol:      getRolFromJwt(payload),
  };
}

function saveTokens(accessToken: string, refreshToken: string, rol: string) {
  localStorage.setItem(STORAGE_ACCESS,  accessToken);
  localStorage.setItem(STORAGE_REFRESH, refreshToken);
  localStorage.setItem(STORAGE_ROLE,    rol);
}

function clearTokens() {
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
  localStorage.removeItem(STORAGE_ROLE);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(() => {
    // Restaurar sesión del localStorage al cargar la app
    const accessToken  = localStorage.getItem(STORAGE_ACCESS);
    const refreshToken = localStorage.getItem(STORAGE_REFRESH);

    if (accessToken && refreshToken) {
      const payload = parseJwt(accessToken);
      if (payload && !isTokenExpiringSoon(payload, 0)) {
        return {
          user: buildUser(payload),
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        };
      }
    }
    return { user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false };
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-refresh ─────────────────────────────────────────────────────────
  const scheduleRefresh = useCallback((payload: JwtPayload, refreshTkn: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    // Refrescar 60 segundos antes de que expire el access_token
    const msUntilRefresh = Math.max(payload.exp * 1000 - Date.now() - 60_000, 5_000);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const tokens  = await authService.refreshToken(refreshTkn);
        const newPayload = parseJwt(tokens.access_token);
        if (!newPayload) throw new Error('Token inválido');

        const user = buildUser(newPayload);
        saveTokens(tokens.access_token, tokens.refresh_token, user.rol);
        setState((prev) => ({
          ...prev,
          accessToken:  tokens.access_token,
          refreshToken: tokens.refresh_token,
          user,
        }));
        scheduleRefresh(newPayload, tokens.refresh_token);
      } catch {
        // Refresh falló → cerrar sesión y redirigir al login
        clearTokens();
        setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
        navigate('/login');
      }
    }, msUntilRefresh);
  }, []);

  // Arrancar auto-refresh si ya había sesión guardada
  useEffect(() => {
    if (state.isAuthenticated && state.accessToken && state.refreshToken) {
      const payload = parseJwt(state.accessToken);
      if (payload) scheduleRefresh(payload, state.refreshToken);
    }
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  // Solo ejecutar al montar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const tokens  = await authService.login(username, password);
      const payload = parseJwt(tokens.access_token);
      if (!payload) throw new Error('Token inválido recibido');

      const user = buildUser(payload);
      saveTokens(tokens.access_token, tokens.refresh_token, user.rol);
      setState({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isAuthenticated: true, isLoading: false });
      scheduleRefresh(payload, tokens.refresh_token);
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  }, [scheduleRefresh]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    if (state.refreshToken) {
      await authService.logout(state.refreshToken);
    }
    clearTokens();
    setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  }, [state.refreshToken]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
