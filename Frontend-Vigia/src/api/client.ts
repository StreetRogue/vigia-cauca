import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// ── Helpers para leer el token y el rol de Keycloak ──────────────────────────
// Keycloak almacena el token en localStorage con la clave 'kc-token'.
// Cuando la integración con Keycloak esté completa, reemplazar estas funciones
// por las llamadas al cliente Keycloak real (keycloak.token, keycloak.tokenParsed).

function getKeycloakToken(): string | null {
  return localStorage.getItem('kc-token');
}

function getKeycloakRole(): string {
  return localStorage.getItem('kc-role') ?? 'VISITANTE';
}

// ── Resolución de base URLs ────────────────────────────────────────────────────
const API_MODE = import.meta.env.VITE_API_MODE ?? 'direct';
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8080';

export const BASE_URLS = {
  novedades:
    API_MODE === 'gateway'
      ? GATEWAY
      : (import.meta.env.VITE_API_NOVEDADES_URL ?? 'http://localhost:5003'),
  reportes:
    API_MODE === 'gateway'
      ? GATEWAY
      : (import.meta.env.VITE_API_REPORTES_URL ?? 'http://localhost:5004'),
  ubicaciones:
    API_MODE === 'gateway'
      ? GATEWAY
      : (import.meta.env.VITE_API_UBICACIONES_URL ?? 'http://localhost:8082'),
};

// ── Factory para instancias Axios ─────────────────────────────────────────────
function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request: agrega token de Keycloak y rol del usuario
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getKeycloakToken();
    const role = getKeycloakRole();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-User-Role'] = role;

    return config;
  });

  // Response: manejo centralizado de errores HTTP
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status: number = error.response?.status;

      if (status === 401) {
        // Token expirado o inválido → limpiar sesión y redirigir
        localStorage.removeItem('kc-token');
        localStorage.removeItem('kc-role');
        window.location.href = '/login';
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

// ── Clientes Axios por microservicio ──────────────────────────────────────────
export const novedadesClient  = createClient(BASE_URLS.novedades);
export const reportesClient   = createClient(BASE_URLS.reportes);
export const ubicacionesClient = createClient(BASE_URLS.ubicaciones);
