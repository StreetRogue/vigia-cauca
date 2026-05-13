import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './UserTopbarDropdown.module.css';

interface UserTopbarDropdownProps {
  displayName: string;
  displayRole: string;
}

export function UserTopbarDropdown({ displayName, displayRole }: UserTopbarDropdownProps) {
  const [open, setOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.rol === 'ADMIN';

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (chipRef.current && !chipRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className={styles.userChipWrapper} ref={chipRef}>
      <div
        className={`${styles.userChip} ${open ? styles.userChipOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className={styles.avatar}>{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <div className={styles.userName}>{displayName}</div>
          <span className={styles.userRole}>{displayRole}</span>
        </div>
        <svg
          viewBox="0 0 10 6"
          width={10}
          height={6}
          fill="none"
          className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {open && (
        <div className={styles.userDropdown}>
          <div className={styles.userDropdownHeader}>
            <div className={styles.userDropdownName}>{displayName}</div>
            <span className={styles.userDropdownRole}>{displayRole}</span>
          </div>
          <div className={styles.userDropdownDivider} />

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

          <button
            className={`${styles.userDropdownItem} ${styles.userDropdownItemDanger}`}
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
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
  );
}
