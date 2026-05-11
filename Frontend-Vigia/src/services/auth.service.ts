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

/** Autenticar con username y contraseña → devuelve tokens de Keycloak. */
export async function login(username: string, password: string): Promise<TokenResponse> {
  const res = await fetch(LOGIN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg = (err.error_description ?? err.message ?? 'Credenciales inválidas') as string;
    throw new Error(msg);
  }

  return res.json() as Promise<TokenResponse>;
}

/**
 * Renovar el access_token.
 * El refresh también pasa por el Gateway si existe ese endpoint,
 * si no, llama directo a Keycloak (el refresh_token no requiere client_secret en public clients).
 * Por ahora reutilizamos el login endpoint del Gateway que devuelve el mismo shape.
 */
export async function refreshToken(currentRefreshToken: string): Promise<TokenResponse> {
  // El Gateway no expone refresh todavía → llamamos directo a Keycloak
  // (el refresh_token no requiere client_secret si el cliente es public,
  //  o el Gateway puede ser extendido en el futuro con /api/auth/refresh)
  const KC_URL   = import.meta.env.VITE_KEYCLOAK_URL   ?? 'http://localhost:8180';
  const KC_REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? 'security-realm-dev';
  const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'api-gateway';

  const res = await fetch(
    `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        grant_type:    'refresh_token',
        client_id:     CLIENT_ID,
        refresh_token: currentRefreshToken,
      }).toString(),
    },
  );

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
