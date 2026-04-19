import { useState } from 'react';
import {
  DEFAULT_ROLE,
  extractKeycloakDisplayName,
  extractKeycloakRoles,
  getMenuItemsForRole,
  resolveAppRole,
  type AppRole,
  type KeycloakTokenLike,
} from '../constants/menuConfig';
import { NavMenu } from '../components/molecules/NavMenu';
import { UserCard } from '../components/molecules/UserCard';

export interface User {
  name: string;
  roles?: string[];
  role?: string;
}

interface UseSidebarConfigProps {
  user?: User;
  keycloakToken?: KeycloakTokenLike;
  clientId?: string;
}

export function useSidebarConfig(props?: UseSidebarConfigProps) {
  const tokenRoles = extractKeycloakRoles(props?.keycloakToken, props?.clientId);
  const rawRoles = tokenRoles.length > 0
    ? tokenRoles
    : props?.user?.roles ?? (props?.user?.role ? [props.user.role] : []);
  const userRole: AppRole = rawRoles.length > 0 ? resolveAppRole(rawRoles) : DEFAULT_ROLE;
  const userName = props?.keycloakToken ? extractKeycloakDisplayName(props.keycloakToken) : props?.user?.name || 'Usuario';

  const [selectedMenuItem, setSelectedMenuItem] = useState(
    getMenuItemsForRole(userRole)[0]?.label || 'DASHBOARD'
  );

  const menuItems = getMenuItemsForRole(userRole);

  return {
    title: 'VIGIA CAUCA',
    subtitle: 'GESTION INTEGRAL',
    nav: (
      <NavMenu
        items={menuItems}
        selectedItem={selectedMenuItem}
        onItemSelect={setSelectedMenuItem}
      />
    ),
    footer: <UserCard name={userName} role={userRole} />,
  };
}
