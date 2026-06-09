import { useAuth } from '../context/AuthContext';
import { getMenuItemsForRole, resolveAppRole } from '../constants/menuConfig';
import { NavMenu } from '../components/molecules/NavMenu';
import dashboardIcon from '../assets/Dashboard_Icon.svg';
import novedadesIcon from '../assets/novedades_icon.svg';
import usuariosIcon from '../assets/usuarios_icon.svg';
import auditoriaIcon from '../assets/auditoria_icon.svg';
import configuracionIcon from '../assets/configuracion_icon.svg';

const ICON_MAP: Record<string, string> = {
  DASHBOARD: dashboardIcon,
  NOVEDADES: novedadesIcon,
  USUARIOS: usuariosIcon,
  AUDITORIAS: auditoriaIcon,
  CONFIGURACION: configuracionIcon,
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function useSidebarNav(selectedItem: string) {
  const { user, logout } = useAuth();

  const role = resolveAppRole([user?.rol ?? '']);
  const items = getMenuItemsForRole(role).map((item) => ({
    ...item,
    icon: <img src={ICON_MAP[item.label]} alt="" />,
  }));

  const displayName = user?.name ?? user?.username ?? 'Usuario';
  const displayRole = user?.rol ?? 'OPERADOR';
  const isAdmin = user?.rol === 'ADMIN';
  const initials = getInitials(displayName);

  const sidebarNav = <NavMenu items={items} selectedItem={selectedItem} />;

  return {
    user,
    logout,
    displayName,
    displayRole,
    isAdmin,
    initials,
    sidebarNav,
  };
}
