import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// ── URL única del API Gateway ─────────────────────────────────────────────────
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8080';

// ── Helpers de sesión ─────────────────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem('kc-token');
}

function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// ── Cliente Axios único ───────────────────────────────────────────────────────
function createGatewayClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: GATEWAY,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request: adjunta Bearer token en cada petición autenticada
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      const decoded = decodeToken(token);
      if (config.url?.includes('usuarios/registrar')) {
        console.log('[DEBUG] Token decodificado:', decoded);
        console.log('[DEBUG] Rol en token:', decoded?.realm_access?.roles || decoded?.roles || 'No disponible');
      }
    }
    if (config.url?.includes('usuarios/registrar')) {
      console.log('[DEBUG] Crear usuario - URL:', config.url);
      console.log('[DEBUG] Crear usuario - Payload:', config.data);
      console.log('[DEBUG] Token:', token ? 'Presente' : 'NO PRESENTE');
    }
    return config;
  });

  // Response: manejo centralizado de errores HTTP
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status: number = error.response?.status;

      if (status === 401) {
        // Solo redirigir al login si realmente había una sesión activa.
        // Si no había token, es una petición anónima que simplemente falló.
        const hadSession = !!localStorage.getItem('kc-token');
        localStorage.removeItem('kc-token');
        localStorage.removeItem('kc-refresh');
        localStorage.removeItem('kc-role');
        if (hadSession) {
          // Usar navigate de React Router si está disponible,
          // o fallback a window.location para no perder el historial.
          window.location.href = '/login';
        }
      }

      if (status === 403) {
        console.warn('[Vigia] Acceso denegado:', error.config?.url);
      }

      if (status >= 500) {
        console.error('[Vigia] Error de servidor:', error.response?.data);
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

// ── Instancia única compartida ────────────────────────────────────────────────
// Todos los servicios usan este cliente; el Gateway enruta al microservicio correcto.
export const apiClient = createGatewayClient();

// Aliases para compatibilidad con los servicios existentes
export const novedadesClient   = apiClient;
export const reportesClient    = apiClient;
export const ubicacionesClient = apiClient;
export const usuariosClient    = apiClient;
