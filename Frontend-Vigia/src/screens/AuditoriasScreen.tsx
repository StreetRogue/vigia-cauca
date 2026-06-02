import { useState } from 'react';
import { ManagementTemplate } from '../components/templates/ManagementTemplate/ManagementTemplate';
import { NavMenu } from '../components/molecules/NavMenu';
import { UserDropdownSection } from '../components/organisms/UserDropdownSection/UserDropdownSection';
import { AuditoriasListPanel } from '../components/organisms/auditorias/AuditoriasListPanel';
import { AuditoriasDetailPanel } from '../components/organisms/auditorias/AuditoriasDetailPanel';
import { useAuth } from '../context/AuthContext';
import { getMenuItemsForRole, resolveAppRole } from '../constants/menuConfig';
import type { AuditoriaDTORespuesta } from '../types/novedad.types';
import dashboardIcon    from '../assets/Dashboard_Icon.svg';
import novedadesIcon    from '../assets/novedades_icon.svg';
import usuariosIcon     from '../assets/usuarios_icon.svg';
import auditoriaIcon    from '../assets/auditoria_icon.svg';
import configuracionIcon from '../assets/configuracion_icon.svg';
import styles from './AuditoriasScreen.module.css';

const ICON_MAP: Record<string, string> = {
  DASHBOARD:     dashboardIcon,
  NOVEDADES:     novedadesIcon,
  USUARIOS:      usuariosIcon,
  AUDITORIAS:    auditoriaIcon,
  CONFIGURACION: configuracionIcon,
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function AuditoriasScreen() {
  const { user, logout } = useAuth();

  const [selectedAuditoria, setSelectedAuditoria] = useState<AuditoriaDTORespuesta | null>(null);

  const role      = resolveAppRole([user?.rol ?? '']);
  const items     = getMenuItemsForRole(role).map(item => ({
    ...item,
    icon: <img src={ICON_MAP[item.label]} alt="" style={{ width: 18, height: 18, filter: 'brightness(0) invert(1)', opacity: 0.7 }} />,
  }));
  const initials    = getInitials(user?.name ?? user?.username ?? 'U');
  const displayName = user?.name ?? user?.username ?? 'Usuario';
  const displayRole = user?.rol ?? 'ADMIN';
  const isAdmin     = user?.rol === 'ADMIN';

  const sidebarNav = <NavMenu items={items} selectedItem="AUDITORIAS" />;

  const sidebarFooter = (
    <div className={styles.sidebarUser}>
      <div className={styles.sidebarAvatar}>{initials}</div>
      <div>
        <p className={styles.sidebarName}>{displayName}</p>
        <p className={styles.sidebarRole}>{displayRole}</p>
      </div>
    </div>
  );

  const breadcrumb = (
    <>
      <span>Dashboard / </span>
      <strong>Auditorías</strong>
    </>
  );

  const topbarUser = (
    <UserDropdownSection
      displayName={displayName}
      displayRol={displayRole}
      isAdmin={isAdmin}
      onLogout={logout}
    />
  );

  return (
    <ManagementTemplate
      sidebarTitle="VIGIA CAUCA"
      sidebarSubtitle="GESTION INTEGRAL"
      sidebarNav={sidebarNav}
      sidebarFooter={sidebarFooter}
      breadcrumb={breadcrumb}
      topbarUser={topbarUser}
      mainPanel={
        <AuditoriasListPanel
          onSelect={a => setSelectedAuditoria(a)}
          selectedId={selectedAuditoria?.auditoriaId ?? null}
        />
      }
      rightPanel={
        <AuditoriasDetailPanel auditoria={selectedAuditoria} />
      }
    />
  );
}
