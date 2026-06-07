/**
 * auth.service.ts
 * Autenticación a través del API Gateway.
 * El Gateway es el único que conoce el client_secret de Keycloak —
 * el frontend nunca lo maneja directamente.
 *
 * POST /api/auth/login  → { username, password }  → TokenResponse
 * POST /api/auth/logout → { refreshToken }         → void
 */

const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8080';

const LOGIN_URL  = `${GATEWAY}/api/auth/login`;
const LOGOUT_URL = `${GATEWAY}/api/auth/logout`;

export interface TokenResponse {
  access_token:       string;
  refresh_token:      string;
  expires_in:         number;
  refresh_expires_in: number;
  token_type:         string;
}

/** Autenticar con email/username y contraseña → devuelve tokens de Keycloak. */
export async function login(emailOrUsername: string, password: string): Promise<TokenResponse> {
  const res = await fetch(LOGIN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username: emailOrUsername, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg = (err.error_description ?? err.message ?? 'Credenciales inválidas') as string;
    throw new Error(msg);
  }

  return res.json() as Promise<TokenResponse>;
}

/** Renovar el access_token a través del Gateway (que añade el client_secret de Keycloak). */
export async function refreshToken(currentRefreshToken: string): Promise<TokenResponse> {
  const res = await fetch(`${GATEWAY}/api/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refreshToken: currentRefreshToken }),
  });

  if (!res.ok) throw new Error('Sesión expirada');
  return res.json() as Promise<TokenResponse>;
}

/** Cerrar sesión — invalida el refresh_token en Keycloak vía Gateway. */
export async function logout(currentRefreshToken: string): Promise<void> {
  await fetch(LOGOUT_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refreshToken: currentRefreshToken }),
  }).catch(() => { /* silenciar error de red */ });
}
