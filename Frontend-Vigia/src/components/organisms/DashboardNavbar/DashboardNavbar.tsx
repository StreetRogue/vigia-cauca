import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import { useAuth } from '../../../context/AuthContext';
import { ubicacionesService } from '../../../services/ubicaciones.service';
import type { FiltrosDashboard } from '../../../types/estadisticas.types';
import type { CategoriaEvento, NivelConfianza } from '../../../types/novedad.types';
import styles from './DashboardNavbar.module.css';

// ── Opciones de filtros ────────────────────────────────────────────────────────

const YEARS = ['Todos', '2022', '2023', '2024', '2025', '2026'];

const MESES = [
  'Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const CATEGORIAS: string[] = [
  'Todos', 'ENFRENTAMIENTO', 'HOSTIGAMIENTO', 'ATENTADO_TERRORISTA',
  'ATAQUE_CON_DRON', 'HOMICIDIO', 'SECUESTRO', 'RETEN_ILEGAL',
  'RECLUTAMIENTO_ILICITO', 'ACCION_DE_PROTESTA', 'HALLAZGO_DE_MATERIAL', 'OTRO',
];

const CONFIANZAS: string[] = ['Todos', 'PRELIMINAR', 'EN_VERIFICACION', 'CONFIRMADO'];

const FILTER_LABELS = ['AÑO', 'MES', 'MUNICIPIO', 'CATEGORÍA', 'CONFIANZA'] as const;
type FilterLabel = typeof FILTER_LABELS[number];

const DEFAULT_FILTER_VALUES: Record<FilterLabel, string> = {
  'AÑO': 'Todos', 'MES': 'Todos', 'MUNICIPIO': 'Todos',
  'CATEGORÍA': 'Todos', 'CONFIANZA': 'Todos',
};

// ── Ícono escudo ───────────────────────────────────────────────────────────────

function ShieldIcon() {
  return (
    <div className={styles.shieldIcon}>
      <svg viewBox="0 0 16 18" width={14} height={14} fill="none">
        <path d="M8 1L1 4v5c0 4.4 3 7.5 7 8.5C15 16.5 15 9 15 9V4L8 1z"
          stroke="var(--dash-accent)" strokeWidth="1.2" fill="rgba(255,79,0,0.12)" />
        <path d="M5 9l2 2 4-4" stroke="var(--dash-accent)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── UserSection con dropdown de navegación ─────────────────────────────────────

interface UserSectionProps {
  displayName: string; displayRol: string;
  isAdmin: boolean;
  onLogout: () => void;
}

function UserSection({ displayName, displayRol, isAdmin, onLogout }: UserSectionProps) {
  const [open, setOpen] = useState(false);
  const chipRef           = useRef<HTMLDivElement>(null);
  const navigate          = useNavigate();
  const { pathname }      = useLocation();

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (chipRef.current && !chipRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const go = (path: string) => { setOpen(false); navigate(path); };

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

// ── Componente principal ───────────────────────────────────────────────────────

interface DashboardNavbarProps {
  onFilterChange?: (filtros: FiltrosDashboard) => void;
}

export function DashboardNavbar({ onFilterChange }: DashboardNavbarProps = {}) {
  const [menuOpen, setMenuOpen]             = useState(false);
  const [openFilter, setOpenFilter]         = useState<FilterLabel | null>(null);
  const [filterValues, setFilterValues]     = useState<Record<FilterLabel, string>>(DEFAULT_FILTER_VALUES);
  const [municipioNames, setMunicipioNames] = useState<string[]>([]);

  const filtersRef  = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();
  const { pathname} = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const displayName = user?.name ?? user?.username ?? 'Usuario';
  const displayRol  = user?.rol ?? 'OPERADOR';
  const isAdmin     = user?.rol === 'ADMIN';

  // Cargar municipios
  useEffect(() => {
    ubicacionesService.getMunicipios()
      .then((data) => setMunicipioNames(['Todos', ...data.map((m) => m.nombre)]))
      .catch(() => setMunicipioNames(['Todos']));
  }, []);

  // Cerrar filtro dropdown al clic fuera
  useEffect(() => {
    if (!openFilter) return;
    const handler = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openFilter]);

  // Opciones de cada filtro
  const filterOptions: Record<FilterLabel, string[]> = {
    'AÑO':       YEARS,
    'MES':       MESES,
    'MUNICIPIO': municipioNames.length > 1 ? municipioNames : ['Todos'],
    'CATEGORÍA': CATEGORIAS,
    'CONFIANZA': CONFIANZAS,
  };

  // Aplicar filtro seleccionado
  const handleFilterSelect = useCallback((label: FilterLabel, value: string) => {
    const newValues = { ...filterValues, [label]: value };
    setFilterValues(newValues);
    setOpenFilter(null);

    const filtros: FiltrosDashboard = {};
    if (newValues['AÑO'] !== 'Todos')       filtros.anio          = Number(newValues['AÑO']);
    if (newValues['MES'] !== 'Todos')        filtros.mes           = MESES.indexOf(newValues['MES']);
    if (newValues['MUNICIPIO'] !== 'Todos')  filtros.municipio     = newValues['MUNICIPIO'];
    if (newValues['CATEGORÍA'] !== 'Todos')  filtros.categoria     = newValues['CATEGORÍA'] as CategoriaEvento;
    if (newValues['CONFIANZA'] !== 'Todos')  filtros.nivelConfianza = newValues['CONFIANZA'] as NivelConfianza;

    onFilterChange?.(filtros);
  }, [filterValues, onFilterChange]);

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  const resetFilters = () => {
    setFilterValues(DEFAULT_FILTER_VALUES);
    onFilterChange?.({});
  };

  const anyActive = Object.values(filterValues).some((v) => v !== 'Todos');

  return (
    <>
      <nav className={styles.navbar}>
        {/* Logo */}
        <div className={styles.brand} onClick={() => navigate('/dashboard')}>
          <ShieldIcon />
          <div>
            <div className={styles.brandName}>VIGÍA CAUCA</div>
            <div className={styles.brandSub}>MONITOREO TÁCTICO</div>
          </div>
        </div>

        <div className={styles.dividerV} />

        {/* Nav: Estadísticas */}
        <button
          className={`${styles.statsNavBtn} ${pathname === '/estadisticas' ? styles.statsNavActive : ''}`}
          onClick={() => navigate('/estadisticas')}
        >
          <svg viewBox="0 0 16 14" width={13} height={13} fill="none">
            <rect x="1"  y="7" width="2.5" height="7"  rx="1" fill="var(--dash-accent)" />
            <rect x="5"  y="4" width="2.5" height="10" rx="1" fill="var(--dash-accent)" opacity="0.7" />
            <rect x="9"  y="1" width="2.5" height="13" rx="1" fill="var(--dash-accent)" opacity="0.5" />
            <rect x="13" y="5" width="2.5" height="9"  rx="1" fill="var(--dash-accent)" opacity="0.6" />
          </svg>
          <CapLabel size={8} color="var(--dash-accent)">ESTADÍSTICAS</CapLabel>
        </button>

        <div className={styles.dividerV} />

        {/* Status */}
        <div className={styles.status}>
          <div className={styles.statusDot} />
          <span className={styles.statusText}>EN LÍNEA</span>
        </div>

        {/* Filters */}
        <div className={styles.filters} ref={filtersRef}>
          {FILTER_LABELS.map((label) => {
            const value    = filterValues[label];
            const isOpen   = openFilter === label;
            const isActive = value !== 'Todos';

            return (
              <div key={label} className={styles.filterWrapper}>
                <div
                  className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ''} ${isOpen ? styles.filterChipOpen : ''}`}
                  onClick={() => setOpenFilter(isOpen ? null : label)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setOpenFilter(isOpen ? null : label)}
                >
                  <CapLabel size={7} color={isActive ? 'var(--dash-accent)' : 'var(--dash-text-3)'}>{label}</CapLabel>
                  <div className={`${styles.filterVal} ${isActive ? styles.filterValActive : ''}`}>{value}</div>
                </div>

                {isOpen && (
                  <div className={styles.filterDropdown}>
                    {filterOptions[label].map((opt) => (
                      <button key={opt}
                        className={`${styles.filterOption} ${value === opt ? styles.filterOptionSelected : ''}`}
                        onClick={() => handleFilterSelect(label, opt)}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {anyActive && (
            <button className={styles.filterReset} onClick={resetFilters} title="Limpiar filtros">
              <svg viewBox="0 0 12 12" width={9} height={9} fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="var(--dash-text-3)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Right section */}
        <div className={styles.right}>
          {isAuthenticated ? (
            <UserSection
              displayName={displayName}
              displayRol={displayRol}
              isAdmin={isAdmin}
              onLogout={handleLogout}
            />
          ) : (
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>
              INICIAR SESIÓN
            </button>
          )}
        </div>

        {/* Hamburger */}
        <button className={styles.hamburger} onClick={() => setMenuOpen((o) => !o)}
          aria-label="Abrir menú" aria-expanded={menuOpen}>
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
          {/* Navegación */}
          {isAuthenticated && (
            <>
              <div className={styles.drawerSection}>
                <CapLabel color="var(--dash-text-3)">NAVEGACIÓN</CapLabel>
                <div className={styles.drawerNavGrid}>
                  {[
                    { path: '/dashboard',    label: 'Dashboard'     },
                    { path: '/estadisticas', label: 'Estadísticas'  },
                    { path: '/novedades',    label: 'Novedades'     },
                    ...(isAdmin ? [{ path: '/usuarios', label: 'Usuarios' }] : []),
                    { path: '/configuracion', label: 'Configuración' },
                  ].map(({ path, label }) => (
                    <button key={path}
                      className={`${styles.drawerNavBtn} ${pathname === path ? styles.drawerNavActive : ''}`}
                      onClick={() => { setMenuOpen(false); navigate(path); }}>
                      <CapLabel size={9} color="inherit">{label.toUpperCase()}</CapLabel>
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.drawerDivider} />
            </>
          )}

          {/* Filtros */}
          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionHeader}>
              <CapLabel color="var(--dash-text-3)">FILTROS</CapLabel>
              {anyActive && (
                <button className={styles.drawerResetBtn} onClick={resetFilters}>
                  <CapLabel size={7} color="var(--dash-accent)">LIMPIAR</CapLabel>
                </button>
              )}
            </div>
            <div className={styles.drawerFilters}>
              {FILTER_LABELS.map((label) => {
                const value  = filterValues[label];
                const isOpen = openFilter === label;
                const isActive = value !== 'Todos';

                return (
                  <div key={label}>
                    <div
                      className={`${styles.drawerFilterRow} ${isActive ? styles.drawerFilterActive : ''}`}
                      onClick={() => setOpenFilter(isOpen ? null : label)}
                      role="button" tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setOpenFilter(isOpen ? null : label)}
                    >
                      <CapLabel color={isActive ? 'var(--dash-accent)' : 'var(--dash-text-3)'}>{label}</CapLabel>
                      <div className={`${styles.filterVal} ${isActive ? styles.filterValActive : ''}`}>{value}</div>
                    </div>
                    {isOpen && (
                      <div className={styles.drawerFilterOptions}>
                        {filterOptions[label].map((opt) => (
                          <button key={opt}
                            className={`${styles.filterOption} ${value === opt ? styles.filterOptionSelected : ''}`}
                            onClick={() => handleFilterSelect(label, opt)}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.drawerDivider} />

          {/* Usuario */}
          <div className={styles.drawerSection}>
            {isAuthenticated ? (
              <div className={styles.drawerUser}>
                <div className={styles.avatar}>
                  <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
                    <circle cx="8" cy="6" r="3" stroke="var(--color-primary-100)" strokeWidth="1.2" />
                    <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5"
                      stroke="var(--color-primary-100)" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div className={styles.userName}>{displayName}</div>
                  <CapLabel size={8} color="var(--color-primary-400)">{displayRol}</CapLabel>
                </div>
                <button className={styles.drawerLogoutBtn} onClick={handleLogout}>
                  <CapLabel size={8} color="var(--dash-red)">SALIR</CapLabel>
                </button>
              </div>
            ) : (
              <button className={`${styles.loginBtn} ${styles.loginBtnFull}`}
                onClick={() => { setMenuOpen(false); navigate('/login'); }}>
                INICIAR SESIÓN
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
