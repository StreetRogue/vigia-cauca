import { useEffect, useState, useCallback } from "react";
import { NavMenu } from "../../components/molecules/NavMenu";
import { Button } from "../../components/atoms/Button/Button";
import { Pagination } from "../../components/molecules/Pagination/Pagination";
import { UserDropdownSection } from "../../components/organisms/UserDropdownSection/UserDropdownSection";
import { CreateUserDrawer } from "../../components/organisms/CreateUserDrawer/CreateUserDrawer";
import { UserDetailPanel } from "../../components/organisms/usuarios/UserDetailPanel";
import { ManagementTemplate } from "../../components/templates/ManagementTemplate/ManagementTemplate";
import { useAuth } from "../../context/AuthContext";
import { usuariosService } from "../../services/usuarios.service";
import { ubicacionesService } from "../../services/ubicaciones.service";
import type { UsuarioResponseDTO } from "../../types/usuario.types";
import type { MunicipioDTORespuesta } from "../../types/ubicaciones.types";
import dashboardIcon    from "../../assets/Dashboard_Icon.svg";
import novedadesIcon    from "../../assets/novedades_icon.svg";
import usuariosIcon     from "../../assets/usuarios_icon.svg";
import configuracionIcon from "../../assets/configuracion_icon.svg";
import styles from "./UsersManagementPage.module.css";

const menuItems =[
  { label: "DASHBOARD",     icon: <img src={dashboardIcon}     alt="" />, to: "/dashboard"      },
  { label: "NOVEDADES",     icon: <img src={novedadesIcon}     alt="" />, to: "/novedades"      },
  { label: "USUARIOS",      icon: <img src={usuariosIcon}      alt="" />, to: "/usuarios"       },
  { label: "CONFIGURACION", icon: <img src={configuracionIcon} alt="" />, to: "/configuracion" },
];

const PAGE_SIZE = 10;

function getTone(estado: string, rol: string): "blue" | "green" | "orange" {
  if (estado === "INACTIVO") return "orange";
  return rol === "ADMIN" ? "blue" : "green";
}

function getInitials(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

interface AuditActivity {
  id: string;
  text: string;
  date: string;
  dot: 'green' | 'orange' | 'red' | 'blue' | 'gray';
}

function formatAuditDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

export function UsersManagementPage() {
  const { user, logout } = useAuth();
  const [selected, setSelected] = useState("USUARIOS");

  // ── Usuarios ─────────────────────────────────────────────────────────────
  const [usuarios,       setUsuarios]       = useState<UsuarioResponseDTO[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [loadError,      setLoadError]      = useState("");
  const [page,           setPage]           = useState(0);
  const [totalPages,     setTotalPages]     = useState(0);
  const [totalElements,  setTotalElements]  = useState(0);
  const [search,         setSearch]         = useState("");

  // ── Municipios (para el drawer) ───────────────────────────────────────────
  const [municipios, setMunicipios] = useState<MunicipioDTORespuesta[]>([]);

  // ── Auditoría ──────────────────────────────────────────────────────────────
  const [activities, setActivities] = useState<AuditActivity[]>([]);

  // ── Drawer ────────────────────────────────────────────────────────────────
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioResponseDTO | null>(null);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string | null>(null);

  // ── Auth display ──────────────────────────────────────────────────────────
  const displayName = user?.name || user?.username || "Admin";
  const displayRole = user?.rol || "ADMIN";
  const isAdmin = user?.rol === 'ADMIN';
  const initials    = getInitials(displayName);

  // ── Load municipalities once ──────────────────────────────────────────────
  useEffect(() => {
    ubicacionesService.getMunicipios()
      .then(setMunicipios)
      .catch(() => {/* fail silently */});
  },[]);

  // ── Load users ────────────────────────────────────────────────────────────
  const loadUsuarios = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await usuariosService.list({ page, size: PAGE_SIZE });
      setUsuarios(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      setLoadError("Error al cargar los usuarios. Verifique la conexión.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadUsuarios(); }, [loadUsuarios]);

  // ── Load audit activities ──────────────────────────────────────────────────
  const loadAuditActivities = useCallback(async () => {
    try {
      // Obtener más usuarios para construir historial de auditoría
      const res = await usuariosService.list({ page: 0, size: 100 });
      const allUsers = res.content;

      // Construir actividades basadas en fechas de creación y actualización
      const activityMap = new Map<string, { item: AuditActivity; timestamp: number }>();

      for (const usuario of allUsers) {
        // Actividad de creación
        if (usuario.fechaCreacion) {
          const timestamp = new Date(usuario.fechaCreacion).getTime();
          const createdKey = `created-${usuario.idUsuario}`;
          activityMap.set(createdKey, {
            item: {
              id: createdKey,
              text: `Usuario creado: ${usuario.nombre}`,
              date: formatAuditDate(usuario.fechaCreacion),
              dot: 'green' as const,
            },
            timestamp,
          });
        }

        // Actividad de actualización (si es diferente a creación)
        if (
          usuario.fechaActualizacion &&
          usuario.fechaActualizacion !== usuario.fechaCreacion
        ) {
          const timestamp = new Date(usuario.fechaActualizacion).getTime();
          const updatedKey = `updated-${usuario.idUsuario}`;
          activityMap.set(updatedKey, {
            item: {
              id: updatedKey,
              text: `Usuario modificado: ${usuario.nombre}`,
              date: formatAuditDate(usuario.fechaActualizacion),
              dot: 'orange' as const,
            },
            timestamp,
          });
        }
      }

      // Ordenar por timestamp descendente y tomar últimas 5
      const sortedActivities = Array.from(activityMap.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)
        .map((x) => x.item);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error cargando auditoría:', error);
      setActivities([]);
    }
  }, []);

  useEffect(() => {
    loadAuditActivities();
  }, [loadAuditActivities]);

  // ── Search filter ─────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filtered = q
    ? usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.cedula.includes(q),
      )
    : usuarios;

  // ── Metrics ───────────────────────────────────────────────────────────────
  const totalActivos   = usuarios.filter((u) => u.estado === "ACTIVO").length;
  const totalInactivos = usuarios.filter((u) => u.estado === "INACTIVO").length;
  const totalAdmins    = usuarios.filter((u) => u.rol === "ADMIN").length;
  const totalOperadores = usuarios.filter((u) => u.rol === "OPERADOR").length;
  const operPct  = totalElements > 0 ? (totalOperadores / usuarios.length) * 100 : 0;
  const adminPct = totalElements > 0 ? (totalAdmins    / usuarios.length) * 100 : 0;

  // ── Create/Edit user ──────────────────────────────────────────────────────
  const handleCreateUserSave = async (payload: any) => {
    await usuariosService.create(payload);
    setPage(0);
    setSelectedUsuario(null);
    setSelectedUsuarioId(null);
    await loadUsuarios();
    await loadAuditActivities();
  };

  const handleEditUserSave = async (payload: any) => {
    if (!selectedUsuario) return;
    await usuariosService.update(selectedUsuario.idUsuario, payload);
    setSelectedUsuario(null);
    setSelectedUsuarioId(null);
    await loadUsuarios();
    await loadAuditActivities();
  };

  const handleRowClick = (usuario: UsuarioResponseDTO) => {
    if (selectedUsuarioId === usuario.idUsuario) {
      setSelectedUsuario(null);
      setSelectedUsuarioId(null);
    } else {
      setSelectedUsuario(usuario);
      setSelectedUsuarioId(usuario.idUsuario);
    }
  };

  const handleEditClick = (usuario: UsuarioResponseDTO) => {
    setSelectedUsuario(usuario);
    setSelectedUsuarioId(usuario.idUsuario);
    setIsEditDrawerOpen(true);
  };

  const existingEmails = usuarios.map((u) => u.email);

  return (
    <ManagementTemplate
      sidebarTitle="VIGIA CAUCA"
      sidebarSubtitle="GESTION INTEGRAL"
      sidebarNav={<NavMenu items={menuItems} selectedItem={selected} onItemSelect={setSelected} />}
      sidebarFooter={
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>{initials}</div>
          <div>
            <p className={styles.sidebarName}>{displayName}</p>
            <p className={styles.sidebarRole}>{displayRole}</p>
          </div>
        </div>
      }
      breadcrumb={
        <p className={styles.breadcrumbText}>
          <strong>Dashboard</strong> / Gestión de Usuarios
        </p>
      }
      topbarUser={
        <UserDropdownSection displayName={displayName} displayRol={displayRole} isAdmin={isAdmin} onLogout={logout} />
      }
      mainPanelClassName={styles.tablePanel}
      mainPanel={
        <>
          <div className={styles.tableToolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon} aria-hidden="true" />
              <input
                className={styles.searchInput}
                placeholder="Buscar usuario..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
            <span className={styles.counter}>
              {loading ? "Cargando..." : `${totalElements} usuarios`}
            </span>
            <Button type="button" className={styles.createBtn} onClick={() => setIsCreateDrawerOpen(true)}>
              + CREAR USUARIO
            </Button>
          </div>

          {loadError && (
            <div style={{ padding: "12px 24px", fontSize: 12, color: "var(--color-danger, #e74c3c)" }}>
              {loadError}
            </div>
          )}

          <table className={styles.table}>
            <colgroup>
              <col style={{ width: "8%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "18%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>NOMBRE</th>
                <th>CORREO</th>
                <th>ROL</th>
                <th>MUNICIPIO</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "24px 0" }}>
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "24px 0" }}>
                    {search ? "Sin resultados para la búsqueda." : "No hay usuarios registrados."}
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => {
                  const tone     = getTone(u.estado, u.rol);
                  const initials = getInitials(u.nombre);
                  const municipioNombre = u.municipio?.nombre
                    ? u.municipio.nombre.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
                    : "—";
                  const isSelected = selectedUsuarioId === u.idUsuario;
                  return (
                    <tr
                      key={u.idUsuario}
                      className={[styles[tone], isSelected ? styles.rowSelected : ''].filter(Boolean).join(' ')}
                      onClick={() => handleRowClick(u)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        {String(page * PAGE_SIZE + i + 1).padStart(2, "0")}
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={[styles.initial, styles[tone]].join(" ")}>{initials}</span>
                          {u.nombre}
                        </div>
                      </td>
                      <td className={styles.muted}>{u.email}</td>
                      <td>
                        <span className={[styles.tag, u.rol === "ADMIN" ? styles.adminTag : styles.operatorTag].join(" ")}>
                          {u.rol}
                        </span>
                      </td>
                      <td>{municipioNombre}</td>
                      <td>
                        <span className={[styles.tag, u.estado === "ACTIVO" ? styles.activeTag : styles.inactiveTag].join(" ")}>
                          {u.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {!loading && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </>
      }
      rightPanelClassName={styles.rightPanel}
      rightPanel={
        selectedUsuario ? (
          <UserDetailPanel
            usuario={selectedUsuario}
            onEdit={handleEditClick}
            onRefresh={loadUsuarios}
          />
        ) : (
          <>
            <p className={styles.panelTitle}>RESUMEN · SYS-VIG-02</p>

            <div className={styles.metricsGrid}>
            <article className={[styles.metricBox, styles.metricBlue].join(" ")}>
              <strong>{loading ? "—" : totalElements}</strong>
              <div className={styles.metricTextGroup}>
                <span className={styles.metricTitle}>TOTAL USUARIOS</span>
                <span className={styles.metricSubtitle}>registrados</span>
              </div>
            </article>
            <article className={[styles.metricBox, styles.metricGreen].join(" ")}>
              <strong>{loading ? "—" : totalActivos}</strong>
              <div className={styles.metricTextGroup}>
                <span className={styles.metricTitle}>ACTIVOS</span>
                <span className={styles.metricSubtitle}>en servicio</span>
              </div>
            </article>
            <article className={[styles.metricBox, styles.metricGray].join(" ")}>
              <strong>{loading ? "—" : totalInactivos}</strong>
              <div className={styles.metricTextGroup}>
                <span className={styles.metricTitle}>INACTIVOS</span>
                <span className={styles.metricSubtitle}>suspendidos</span>
              </div>
            </article>
            <article className={[styles.metricBox, styles.metricPurple].join(" ")}>
              <strong>{loading ? "—" : totalAdmins}</strong>
              <div className={styles.metricTextGroup}>
                <span className={styles.metricTitle}>ADMINS</span>
                <span className={styles.metricSubtitle}>con acceso total</span>
              </div>
            </article>
          </div>

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>DISTRIBUCIÓN POR ROL</h3>
            <div className={styles.progressGroup}>
              <div className={styles.progressLabelRow}>
                <span>OPERADORES</span>
                <span>{totalOperadores} / {usuarios.length}</span>
              </div>
              <div className={styles.track}>
                <span className={styles.fill} style={{ width: `${operPct}%`, background: "#127850" }} />
              </div>
            </div>
            <div className={styles.progressGroup}>
              <div className={styles.progressLabelRow}>
                <span>ADMINISTRADORES</span>
                <span>{totalAdmins} / {usuarios.length}</span>
              </div>
              <div className={styles.track}>
                <span className={styles.fill} style={{ width: `${adminPct}%`, background: "var(--color-primary-500)" }} />
              </div>
            </div>
          </section>

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>ACTIVIDAD RECIENTE</h3>
            <ul className={styles.activityList}>
              {activities.length > 0 ? (
                activities.map((act) => (
                  <li key={act.id} className={styles.activityItem}>
                    <span className={[styles.dot, styles[act.dot]].join(" ")} aria-hidden="true" />
                    <div>
                      <p className={styles.activityText}>{act.text}</p>
                      <p className={styles.activityDate}>{act.date}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li style={{ padding: '14px 0', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                  No hay actividad reciente
                </li>
              )}
            </ul>
          </section>
          </>
        )
      }
      overlay={
        isCreateDrawerOpen || isEditDrawerOpen ? (
          <CreateUserDrawer
            open={isCreateDrawerOpen || isEditDrawerOpen}
            onClose={() => {
              setIsCreateDrawerOpen(false);
              setIsEditDrawerOpen(false);
            }}
            municipios={municipios}
            existingEmails={existingEmails.filter(e => selectedUsuario ? e !== selectedUsuario.email : true)}
            initialData={selectedUsuario}
            onSave={isEditDrawerOpen ? handleEditUserSave : handleCreateUserSave}
          />
        ) : null
      }
    />
  );
}