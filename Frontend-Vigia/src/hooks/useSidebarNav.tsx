import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMenuItemsForRole, resolveAppRole } from '../constants/menuConfig';
import { NavMenu } from '../components/molecules/NavMenu';
import { usuariosService } from '../services/usuarios.service';
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

  // Nombre real del usuario tomado de la base de datos (getMe está cacheado 5 min,
  // así que esto no genera llamadas repetidas al cambiar de pestaña). Esto garantiza
  // que el nombre mostrado sea el mismo en todas las pantallas y no el del token JWT.
  const [nombreReal, setNombreReal] = useState<string | null>(null);
  useEffect(() => {
    let activo = true;
    // Resetea el nombre al cambiar de usuario para no mostrar el de la sesión previa
    // mientras llega el nuevo getMe (que ahora parte de caché limpia tras el login).
    setNombreReal(null);
    usuariosService.getMe()
      .then((data) => { if (activo) setNombreReal(data.nombre ?? null); })
      .catch(() => {/* fail silently: se usa el nombre del token como respaldo */});
    return () => { activo = false; };
  }, [user?.sub]);

  const role = resolveAppRole([user?.rol ?? '']);
  const items = getMenuItemsForRole(role).map((item) => ({
    ...item,
    icon: <img src={ICON_MAP[item.label]} alt="" />,
  }));

  const displayName = nombreReal ?? user?.name ?? user?.username ?? 'Usuario';
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
