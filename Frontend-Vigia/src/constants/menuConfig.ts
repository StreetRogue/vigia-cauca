import type { ReactNode } from "react";

export type AppRole = "ADMIN" | "OPERADOR" | "VISITANTE";
export const DEFAULT_ROLE: AppRole = "VISITANTE";

export interface KeycloakTokenLike {
  name?: string;
  preferred_username?: string;
  given_name?: string;
  resource_access?: Record<string, { roles?: string[] }>;
  realm_access?: { roles?: string[] };
}

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  /** Ruta de navegación; undefined = ítem aún sin página propia */
  to?: string;
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { label: "DASHBOARD",     to: "/dashboard"      },
  { label: "NOVEDADES",     to: "/novedades"      },
  { label: "USUARIOS",      to: "/usuarios"       },
  { label: "CONFIGURACION", to: "/configuracion"  },
];

const ROLE_MENUS: Record<AppRole, string[]> = {
  ADMIN:     ["DASHBOARD", "NOVEDADES", "USUARIOS", "CONFIGURACION"],
  OPERADOR:  ["DASHBOARD", "NOVEDADES", "CONFIGURACION"],
  VISITANTE: ["DASHBOARD"],
};

export function getMenuItemsForRole(role: AppRole): MenuItem[] {
  const allowed = ROLE_MENUS[role] ?? ROLE_MENUS[DEFAULT_ROLE];
  return ALL_MENU_ITEMS.filter((item) => allowed.includes(item.label));
}

export function resolveAppRole(roles: string[]): AppRole {
  if (roles.some((r) => r.toLowerCase().includes("admin")))    return "ADMIN";
  if (roles.some((r) => r.toLowerCase().includes("operador"))) return "OPERADOR";
  return "VISITANTE";
}

export function extractKeycloakRoles(token?: KeycloakTokenLike, clientId?: string): string[] {
  if (!token) return [];
  const clientRoles = clientId ? token.resource_access?.[clientId]?.roles ?? [] : [];
  const realmRoles = token.realm_access?.roles ?? [];
  return [...clientRoles, ...realmRoles];
}

export function extractKeycloakDisplayName(token: KeycloakTokenLike): string {
  return token.name ?? token.given_name ?? token.preferred_username ?? "Usuario";
}
