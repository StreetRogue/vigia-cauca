import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// ── URL única del API Gateway ─────────────────────────────────────────────────
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8080';

// ── Helpers de sesión ─────────────────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem('kc-token');
}

// ── Cliente Axios único ───────────────────────────────────────────────────────
function createGatewayClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: GATEWAY,
    timeout: 30_000, // 30 segundos para soportar cargas masivas
    headers: { 'Content-Type': 'application/json' },
  });

  // Request: adjunta Bearer token. El auto-refresh de AuthContext renueva el token
  // antes de que expire; si de todas formas llega expirado, el 401 del servidor
  // lo captura el interceptor de respuesta.
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
