/**
 * Parsea el payload de un JWT sin verificar la firma (la verificación
 * la hace el backend). Solo para leer claims en el frontend.
 */
export interface JwtPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?:    { roles: string[] };
  resource_access?: Record<string, { roles: string[] }>;
  exp: number;
  iat: number;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extrae el rol principal del JWT normalizando a mayúsculas.
 * Busca en dos fuentes (igual que el backend):
 *   1. realm_access.roles          (roles de realm)
 *   2. resource_access.*.roles     (roles de cliente, cualquier clientId)
 */
export function getRolFromJwt(payload: JwtPayload): string {
  // Recopilar todos los roles de ambas fuentes, normalizados a mayúsculas
  const allRoles: string[] = [];

  (payload.realm_access?.roles ?? []).forEach((r) => allRoles.push(r.toUpperCase()));

  Object.values(payload.resource_access ?? {}).forEach((client) => {
    (client.roles ?? []).forEach((r) => allRoles.push(r.toUpperCase()));
  });

  if (allRoles.includes('ADMIN'))    return 'ADMIN';
  if (allRoles.includes('OPERADOR')) return 'OPERADOR';
  return allRoles[0] ?? 'VISITANTE';
}

/** Devuelve true si el token expira en menos de `marginSec` segundos. */
export function isTokenExpiringSoon(payload: JwtPayload, marginSec = 60): boolean {
  return payload.exp * 1000 - Date.now() < marginSec * 1000;
}
