import { useState } from 'react';
import { NavMenu }            from '../../components/molecules/NavMenu';
import { Button }             from '../../components/atoms/Button/Button';
import { UserDropdownSection } from '../../components/organisms/UserDropdownSection/UserDropdownSection';
import { ManagementTemplate } from '../../components/templates/ManagementTemplate/ManagementTemplate';
import { useAuth }            from '../../context/AuthContext';
import { usuariosService }    from '../../services/usuarios.service';
import { getMenuItemsForRole, resolveAppRole } from '../../constants/menuConfig';
import dashboardIcon     from '../../assets/Dashboard_Icon.svg';
import novedadesIcon     from '../../assets/novedades_icon.svg';
import usuariosIcon      from '../../assets/usuarios_icon.svg';
import reportesIcon      from '../../assets/reportes_icon.svg';
import configuracionIcon from '../../assets/configuracion_icon.svg';
import styles            from './SettingsPage.module.css';

const ICON_MAP: Record<string, string> = {
  DASHBOARD:     dashboardIcon,
  NOVEDADES:     novedadesIcon,
  USUARIOS:      usuariosIcon,
  REPORTES:      reportesIcon,
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

interface EditableInfoRowProps {
  label: string;
  value: string | null | undefined;
  editable: boolean;
  isEditing: boolean;
  onChange: (value: string) => void;
}

function EditableInfoRow({ label, value, editable, isEditing, onChange }: EditableInfoRowProps) {
  if (!editable) {
    return <InfoRow label={label} value={value} />;
  }

  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      {isEditing ? (
        <input
          type="text"
          className={styles.editInput}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ingresa tu ${label.toLowerCase()}`}
        />
      ) : (
        <span className={styles.infoValue}>{value ?? '—'}</span>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const menuItems = getMenuItemsForRole(resolveAppRole([user?.rol ?? ''])).map((item) => ({
    ...item,
    icon: <img src={ICON_MAP[item.label]} alt="" />,
  }));

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editEmail, setEditEmail] = useState(user?.email ?? '');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const displayName = user?.name ?? user?.username ?? 'Usuario';
  const initials = getInitials(displayName);

  const handleSave = async () => {
    if (!user?.sub) return;

    if (!editName.trim() || !editEmail.trim()) {
      setMessage({ type: 'error', text: 'Nombre y email son requeridos.' });
      return;
    }

    setSaving(true);
    try {
      await usuariosService.update(user.sub, {
        nombre: editName,
        email: editEmail,
        telefono: editPhone || undefined,
      });
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(user?.name ?? '');
    setEditEmail(user?.email ?? '');
    setEditPhone('');
    setIsEditing(false);
    setMessage(null);
  };

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
        <UserDropdownSection displayName={displayName} displayRol={user?.rol ?? 'OPERADOR'} isAdmin={isAdmin} onLogout={logout} />
      }
      mainPanelClassName={styles.mainPanel}
      mainPanel={
        <>
          {/* ── Perfil ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Información del perfil</h2>
              {!isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  Editar perfil
                </Button>
              )}
            </div>

            <div className={styles.avatarBlock}>
              <div className={styles.avatarLarge}>{initials}</div>
              <div>
                <p className={styles.avatarName}>{displayName}</p>
                <span className={[
                  styles.roleBadge,
                  user?.rol === 'ADMIN' ? styles.roleAdmin : styles.roleOperador,
                ].join(' ')}>
                  {user?.rol ?? 'OPERADOR'}
                </span>
              </div>
            </div>

            {message && (
              <div className={`${styles.messageBanner} ${styles[`message${message.type === 'success' ? 'Success' : 'Error'}`]}`}>
                {message.text}
              </div>
            )}

            <div className={styles.infoGrid}>
              <InfoRow label="Cédula"        value={undefined} />
              <EditableInfoRow
                label="Nombre"
                value={editName}
                editable={true}
                isEditing={isEditing}
                onChange={setEditName}
              />
              <EditableInfoRow
                label="Email"
                value={editEmail}
                editable={true}
                isEditing={isEditing}
                onChange={setEditEmail}
              />
              <EditableInfoRow
                label="Teléfono"
                value={editPhone}
                editable={true}
                isEditing={isEditing}
                onChange={setEditPhone}
              />
              <InfoRow label="Municipio"     value={undefined} />
              <InfoRow label="Usuario"       value={user?.username} />
              <InfoRow label="Rol"           value={user?.rol} />
              <InfoRow label="Estado"        value={undefined} />
              <InfoRow label="Registro"      value={undefined} />
            </div>

            {isEditing && (
              <div className={styles.editActions}>
                <Button
                  type="button"
                  variant="primary"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={saving}
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </div>
            )}
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
            <p className={styles.accountEmail}>{user?.email ?? '—'}</p>
            <span className={[
              styles.accountBadge,
              styles.badgeActive,
            ].join(' ')}>
              ACTIVO
            </span>
          </div>

          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>Rol</span>
              <span className={styles.infoCardValue}>{user?.rol ?? '—'}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>Municipio</span>
              <span className={styles.infoCardValue}>—</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>Usuario</span>
              <span className={styles.infoCardValue}>{user?.username ?? '—'}</span>
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
