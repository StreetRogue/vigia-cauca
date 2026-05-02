import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import styles from './DashboardNavbar.module.css';

const FILTERS = [
  { label: 'AÑO', val: '2025–26' },
  { label: 'MES', val: 'Todos' },
  { label: 'MUNICIPIO', val: 'Todos' },
  { label: 'CATEGORÍA', val: 'Todos' },
  { label: 'CONFIANZA', val: '≥ MEDIA' },
];

function ShieldIcon() {
  return (
    <div className={styles.shieldIcon}>
      <svg viewBox="0 0 16 18" width={14} height={14} fill="none">
        <path
          d="M8 1L1 4v5c0 4.4 3 7.5 7 8.5C15 16.5 15 9 15 9V4L8 1z"
          stroke="var(--dash-accent)"
          strokeWidth="1.2"
          fill="rgba(255,79,0,0.12)"
        />
        <path d="M5 9l2 2 4-4" stroke="var(--dash-accent)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function UserSection() {
  return (
    <>
      <div className={styles.notifBtn}>
        <svg viewBox="0 0 18 20" width={18} height={18} fill="none">
          <path
            d="M9 1a7 7 0 0 1 7 7v3l2 3H0l2-3V8a7 7 0 0 1 7-7z"
            stroke="var(--dash-text-2)"
            strokeWidth="1.3"
          />
          <path d="M7 16c0 1.1.9 2 2 2s2-.9 2-2" stroke="var(--dash-text-2)" strokeWidth="1.3" />
        </svg>
        <div className={styles.notifBadge} />
      </div>

      <div className={styles.dividerV} />

      <div className={styles.userChip}>
        <div className={styles.avatar}>
          <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
            <circle cx="8" cy="6" r="3" stroke="var(--color-primary-100)" strokeWidth="1.2" />
            <path
              d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5"
              stroke="var(--color-primary-100)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <div className={styles.userName}>Operador</div>
          <CapLabel size={7} color="var(--color-primary-400)">OPERADOR</CapLabel>
        </div>
        <svg viewBox="0 0 10 6" width={10} height={6} fill="none" style={{ marginLeft: 2 }}>
          <path d="M1 1l4 4 4-4" stroke="var(--dash-text-2)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      <div className={styles.logoutBtn}>
        <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
          <path
            d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"
            stroke="var(--dash-red)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M10 5l3 3-3 3M13 8H6"
            stroke="var(--dash-red)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <CapLabel size={8} color="var(--dash-red)">SALIR</CapLabel>
      </div>
    </>
  );
}

interface DashboardNavbarProps {
  /** Llamado cuando el usuario cambia filtros desde el navbar */
  onFilterChange?: (filtros: Record<string, string>) => void;
}

export function DashboardNavbar({ onFilterChange: _onFilterChange }: DashboardNavbarProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className={styles.navbar}>
        {/* Logo */}
        <div className={styles.brand}>
          <ShieldIcon />
          <div>
            <div className={styles.brandName}>VIGÍA CAUCA</div>
            <div className={styles.brandSub}>SISTEMA DE MONITOREO TÁCTICO</div>
          </div>
        </div>

        <div className={styles.dividerV} />

        {/* Nav: Estadísticas */}
        <button
          className={styles.statsNavBtn}
          onClick={() => navigate('/estadisticas')}
        >
          <svg viewBox="0 0 16 14" width={13} height={13} fill="none">
            <rect x="1" y="7" width="2.5" height="7" rx="1" fill="var(--dash-accent)" />
            <rect x="5" y="4" width="2.5" height="10" rx="1" fill="var(--dash-accent)" opacity="0.7" />
            <rect x="9" y="1" width="2.5" height="13" rx="1" fill="var(--dash-accent)" opacity="0.5" />
            <rect x="13" y="5" width="2.5" height="9" rx="1" fill="var(--dash-accent)" opacity="0.6" />
          </svg>
          <CapLabel size={8} color="var(--dash-accent)">ESTADÍSTICAS</CapLabel>
        </button>

        <div className={styles.dividerV} />

        {/* Status */}
        <div className={styles.status}>
          <div className={styles.statusDot} />
          <CapLabel color="var(--dash-green)">SISTEMA EN LÍNEA</CapLabel>
        </div>

        {/* Filters — hidden on mobile */}
        <div className={styles.filters}>
          <CapLabel color="var(--dash-text-3)">FILTROS</CapLabel>
          {FILTERS.map(({ label, val }) => (
            <div key={label} className={styles.filterChip}>
              <CapLabel size={7} color="var(--dash-text-3)">{label}</CapLabel>
              <div className={styles.filterVal}>{val}</div>
            </div>
          ))}
          <div className={styles.filterAdd}>
            <svg viewBox="0 0 12 12" width={10} height={10} fill="none">
              <path d="M6 1v10M1 6h10" stroke="var(--dash-text-3)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <CapLabel size={8} color="var(--dash-text-3)">AGREGAR</CapLabel>
          </div>
        </div>

        {/* Right side — hidden on mobile */}
        <div className={styles.right}>
          <UserSection />
        </div>

        {/* Hamburger — visible only on mobile */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg viewBox="0 0 18 18" width={20} height={20} fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="var(--dash-text-1)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 16" width={22} height={22} fill="none">
              <path d="M1 2h18M1 8h18M1 14h18" stroke="var(--dash-text-1)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className={styles.drawer}>
          {/* Filters section */}
          <div className={styles.drawerSection}>
            <CapLabel color="var(--dash-text-3)">FILTROS</CapLabel>
            <div className={styles.drawerFilters}>
              {FILTERS.map(({ label, val }) => (
                <div key={label} className={styles.drawerFilterRow}>
                  <CapLabel color="var(--dash-text-3)">{label}</CapLabel>
                  <div className={styles.filterVal}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.drawerDivider} />

          {/* User section */}
          <div className={styles.drawerSection}>
            <div className={styles.drawerUser}>
              <div className={styles.avatar}>
                <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
                  <circle cx="8" cy="6" r="3" stroke="var(--color-primary-100)" strokeWidth="1.2" />
                  <path
                    d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5"
                    stroke="var(--color-primary-100)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <div className={styles.userName}>Operador</div>
                <CapLabel size={8} color="var(--color-primary-400)">OPERADOR</CapLabel>
              </div>
            </div>

            <div className={styles.drawerActions}>
              <div className={styles.notifBtn}>
                <svg viewBox="0 0 18 20" width={18} height={18} fill="none">
                  <path
                    d="M9 1a7 7 0 0 1 7 7v3l2 3H0l2-3V8a7 7 0 0 1 7-7z"
                    stroke="var(--dash-text-2)"
                    strokeWidth="1.3"
                  />
                  <path d="M7 16c0 1.1.9 2 2 2s2-.9 2-2" stroke="var(--dash-text-2)" strokeWidth="1.3" />
                </svg>
                <div className={styles.notifBadge} />
                <span className={styles.drawerActionLabel}>Notificaciones</span>
              </div>

              <div className={`${styles.logoutBtn} ${styles.logoutBtnFull}`}>
                <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
                  <path
                    d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"
                    stroke="var(--dash-red)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 5l3 3-3 3M13 8H6"
                    stroke="var(--dash-red)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <CapLabel color="var(--dash-red)">CERRAR SESIÓN</CapLabel>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
