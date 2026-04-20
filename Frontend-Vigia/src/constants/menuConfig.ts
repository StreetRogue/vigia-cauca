import type { ReactNode } from "react";

export type AppRole = "ADMIN" | "ANALISTA" | "CONSULTOR";
export const DEFAULT_ROLE: AppRole = "CONSULTOR";

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
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { label: "DASHBOARD" },
  { label: "NOVEDADES" },
  { label: "USUARIOS" },
  { label: "REPORTES" },
  { label: "CONFIGURACION" },
];

const ROLE_MENUS: Record<AppRole, string[]> = {
  ADMIN: ["DASHBOARD", "NOVEDADES", "USUARIOS", "REPORTES", "CONFIGURACION"],
  ANALISTA: ["DASHBOARD", "NOVEDADES", "REPORTES"],
  CONSULTOR: ["DASHBOARD", "REPORTES"],
};

export function getMenuItemsForRole(role: AppRole): MenuItem[] {
  const allowed = ROLE_MENUS[role] ?? ROLE_MENUS[DEFAULT_ROLE];
  return ALL_MENU_ITEMS.filter((item) => allowed.includes(item.label));
}

export function resolveAppRole(roles: string[]): AppRole {
  if (roles.some((r) => r.toLowerCase().includes("admin"))) return "ADMIN";
  if (roles.some((r) => r.toLowerCase().includes("analista"))) return "ANALISTA";
  return "CONSULTOR";
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
