import { useEffect, useState } from 'react';
import { NavMenu }            from '../../components/molecules/NavMenu';
import { Button }             from '../../components/atoms/Button/Button';
import { ManagementTemplate } from '../../components/templates/ManagementTemplate/ManagementTemplate';
import { useAuth }            from '../../context/AuthContext';
import { usuariosService }    from '../../services/usuarios.service';
import { getMenuItemsForRole, resolveAppRole } from '../../constants/menuConfig';
import type { UsuarioResponseDTO } from '../../types/usuario.types';
import dashboardIcon     from '../../assets/Dashboard_Icon.svg';
import novedadesIcon     from '../../assets/novedades_icon.svg';
import usuariosIcon      from '../../assets/usuarios_icon.svg';
import configuracionIcon from '../../assets/configuracion_icon.svg';
import styles            from './ConfiguracionPage.module.css';

const ICON_MAP: Record<string, string> = {
  DASHBOARD:     dashboardIcon,
  NOVEDADES:     novedadesIcon,
  USUARIOS:      usuariosIcon,
  CONFIGURACION: configuracionIcon,
};

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value ?? '—'}</span>
    </div>
  );
}

export function ConfiguracionPage() {
  const { user, logout } = useAuth();
  const [fullUser, setFullUser] = useState<UsuarioResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usuariosService.getMe()
      .then(setFullUser)
      .catch(() => {/* fail silently */})
      .finally(() => setLoading(false));
  }, []);

  const menuItems = getMenuItemsForRole(resolveAppRole([user?.rol ?? ''])).map((item) => ({
    ...item,
    icon: <img src={ICON_MAP[item.label]} alt="" />,
  }));

  const displayName = fullUser?.nombre ?? user?.name ?? user?.username ?? 'Usuario';
  const initials    = getInitials(displayName);

  return (
    <ManagementTemplate
      sidebarTitle="VIGIA CAUCA"
      sidebarSubtitle="GESTION INTEGRAL"
      sidebarNav={<NavMenu items={menuItems} selectedItem="CONFIGURACION" />}
      sidebarFooter={
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>{initials}</div>
          <div>
            <p className={styles.sidebarName}>{displayName}</p>
            <p className={styles.sidebarRole}>{user?.rol ?? 'OPERADOR'}</p>
          </div>
        </div>
      }
      breadcrumb={
        <p className={styles.breadcrumbText}>
          <strong>Dashboard</strong> / Configuración
        </p>
      }
      topbarUser={
        <>
          <div className={styles.topbarAvatar}>{initials}</div>
          <div>
            <p className={styles.topbarName}>{displayName}</p>
            <p className={styles.topbarRole}>{user?.rol ?? 'OPERADOR'}</p>
          </div>
        </>
      }
      mainPanelClassName={styles.mainPanel}
      mainPanel={
        <>
          {/* ── Perfil ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Información del perfil</h2>

            <div className={styles.avatarBlock}>
              <div className={styles.avatarLarge}>{initials}</div>
              <div>
                <p className={styles.avatarName}>{displayName}</p>
                <span className={[
                  styles.roleBadge,
                  fullUser?.rol === 'ADMIN' ? styles.roleAdmin : styles.roleOperador,
                ].join(' ')}>
                  {fullUser?.rol ?? user?.rol ?? 'OPERADOR'}
                </span>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <InfoRow label="Cédula"        value={fullUser?.cedula ?? undefined} />
              <InfoRow label="Nombre"        value={fullUser?.nombre ?? user?.name} />
              <InfoRow label="Email"         value={fullUser?.email ?? user?.email} />
              <InfoRow label="Teléfono"      value={fullUser?.telefono ?? undefined} />
              <InfoRow label="Municipio"     value={fullUser?.municipio?.nombre ?? undefined} />
              <InfoRow label="Usuario"       value={fullUser?.username ?? user?.username} />
              <InfoRow label="Rol"           value={fullUser?.rol ?? user?.rol} />
              <InfoRow label="Estado"        value={fullUser?.estado ?? undefined} />
              <InfoRow label="Registro"      value={fullUser?.fechaCreacion ? new Date(fullUser.fechaCreacion).toLocaleDateString('es-CO') : undefined} />
            </div>
          </section>
        </>
      }
      rightPanelClassName={styles.rightPanel}
      rightPanel={
        <>
          <p className={styles.panelTitle}>Mi cuenta</p>

          <div className={styles.accountCard}>
            <div className={styles.accountAvatar}>{initials}</div>
            <p className={styles.accountName}>{displayName}</p>
            <p className={styles.accountEmail}>{fullUser?.email ?? user?.email ?? '—'}</p>
            <span className={[
              styles.accountBadge,
              fullUser?.estado === 'ACTIVO' ? styles.badgeActive : styles.badgeInactive,
            ].join(' ')}>
              {fullUser?.estado ?? 'ACTIVO'}
            </span>
          </div>

          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>Rol</span>
              <span className={styles.infoCardValue}>{fullUser?.rol ?? user?.rol ?? '—'}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>Municipio</span>
              <span className={styles.infoCardValue}>{fullUser?.municipio?.nombre ?? '—'}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>Usuario</span>
              <span className={styles.infoCardValue}>{fullUser?.username ?? user?.username ?? '—'}</span>
            </div>
          </div>

          <div className={styles.logoutBlock}>
            <Button type="button" variant="ghost" className={styles.logoutBtn} onClick={() => logout()}>
              Cerrar sesión
            </Button>
          </div>
        </>
      }
    />
  );
}
