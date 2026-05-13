import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import styles from './UserDropdownSection.module.css';

interface UserDropdownSectionProps {
  displayName: string;
  displayRol: string;
  isAdmin: boolean;
  onLogout: () => void;
}

export function UserDropdownSection({ displayName, displayRol, isAdmin, onLogout }: UserDropdownSectionProps) {
  const [open, setOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (chipRef.current && !chipRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Notificaciones */}
      <div className={styles.notifBtn}>
        <svg viewBox="0 0 18 20" width={18} height={18} fill="none">
          <path d="M9 1a7 7 0 0 1 7 7v3l2 3H0l2-3V8a7 7 0 0 1 7-7z"
            stroke="var(--dash-text-2)" strokeWidth="1.3" />
          <path d="M7 16c0 1.1.9 2 2 2s2-.9 2-2"
            stroke="var(--dash-text-2)" strokeWidth="1.3" />
        </svg>
        <div className={styles.notifBadge} />
      </div>

      <div className={styles.dividerV} />

      {/* UserChip — abre dropdown */}
      <div className={styles.userChipWrapper} ref={chipRef}>
        <div
          className={`${styles.userChip} ${open ? styles.userChipOpen : ''}`}
          onClick={() => setOpen((o) => !o)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
          aria-expanded={open}
        >
          <div className={styles.avatar}>
            <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
              <circle cx="8" cy="6" r="3" stroke="var(--color-primary-100)" strokeWidth="1.2" />
              <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5"
                stroke="var(--color-primary-100)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className={styles.userName}>{displayName}</div>
            <CapLabel size={7} color="var(--color-primary-400)">{displayRol}</CapLabel>
          </div>
          <svg viewBox="0 0 10 6" width={10} height={6} fill="none"
            className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}
            style={{ marginLeft: 2 }}>
            <path d="M1 1l4 4 4-4" stroke="var(--dash-text-2)"
              strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Dropdown */}
        {open && (
          <div className={styles.userDropdown}>
            {/* Cabecera */}
            <div className={styles.userDropdownHeader}>
              <div className={styles.userDropdownName}>{displayName}</div>
              <CapLabel size={7} color="var(--color-primary-400)">{displayRol}</CapLabel>
            </div>
            <div className={styles.userDropdownDivider} />

            {/* Navegación */}
            <button
              className={`${styles.userDropdownItem} ${pathname === '/dashboard' ? styles.userDropdownItemActive : ''}`}
              onClick={() => go('/dashboard')}
            >
              <svg viewBox="0 0 14 14" width={12} height={12} fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
                <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
                <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
                <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
              </svg>
              Dashboard
            </button>

            <button
              className={`${styles.userDropdownItem} ${pathname === '/estadisticas' ? styles.userDropdownItemActive : ''}`}
              onClick={() => go('/estadisticas')}
            >
              <svg viewBox="0 0 14 12" width={12} height={12} fill="none">
                <rect x="1" y="6" width="2" height="6" rx="1" fill="currentColor" opacity="0.8" />
                <rect x="4.5" y="3.5" width="2" height="8.5" rx="1" fill="currentColor" opacity="0.65" />
                <rect x="8" y="1" width="2" height="11" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="11.5" y="4" width="2" height="8" rx="1" fill="currentColor" opacity="0.6" />
              </svg>
              Estadísticas
            </button>

            <button
              className={`${styles.userDropdownItem} ${pathname === '/novedades' ? styles.userDropdownItemActive : ''}`}
              onClick={() => go('/novedades')}
            >
              <svg viewBox="0 0 14 14" width={12} height={12} fill="none">
                <path d="M11 2H3a1 1 0 0 0-1 1v8l2.5-1.5H11a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"
                  stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                <path d="M4 5.5h6M4 8h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              Novedades
            </button>

            {isAdmin && (
              <button
                className={`${styles.userDropdownItem} ${pathname === '/usuarios' ? styles.userDropdownItemActive : ''}`}
                onClick={() => go('/usuarios')}
              >
                <svg viewBox="0 0 14 14" width={12} height={12} fill="none">
                  <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M1.5 13c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5"
                    stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
                Usuarios
              </button>
            )}

            <button
              className={`${styles.userDropdownItem} ${pathname === '/configuracion' ? styles.userDropdownItemActive : ''}`}
              onClick={() => go('/configuracion')}
            >
              <svg viewBox="0 0 14 14" width={12} height={12} fill="none">
                <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.1" />
                <path d="M7 1v1.5M7 10.5V12M1 7H2.5M11.5 7H13M2.5 2.5l1.06 1.06M10.44 10.44l1.06 1.06M2.5 11.5l1.06-1.06M10.44 3.56l1.06-1.06"
                  stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              Configuración
            </button>

            <div className={styles.userDropdownDivider} />

            <button className={`${styles.userDropdownItem} ${styles.userDropdownItemDanger}`}
              onClick={() => { setOpen(false); onLogout(); }}>
              <svg viewBox="0 0 14 14" width={12} height={12} fill="none">
                <path d="M5 3H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"
                  stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M9 4.5l2.5 2.5-2.5 2.5M11.5 7H5.5"
                  stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </>
  );
}
