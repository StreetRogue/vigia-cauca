import { useEffect, useState } from "react";
import { NavMenu } from "../../components/molecules/NavMenu";
import { Button } from "../../components/atoms/Button/Button";
import { CreateUserDrawer } from "../../components/organisms/CreateUserDrawer";
import { ManagementTemplate } from "../../components/templates/ManagementTemplate/ManagementTemplate";
import dashboardIcon from "../../assets/Dashboard_Icon.svg";
import novedadesIcon from "../../assets/novedades_icon.svg";
import usuariosIcon from "../../assets/usuarios_icon.svg";
import reportesIcon from "../../assets/reportes_icon.svg";
import configuracionIcon from "../../assets/configuracion_icon.svg";
import styles from "./UsersManagementPage.module.css";

const menuItems = [
  { label: "DASHBOARD", icon: <img src={dashboardIcon} alt="" /> },
  { label: "NOVEDADES", icon: <img src={novedadesIcon} alt="" />, to: "/novedades" },
  { label: "USUARIOS", icon: <img src={usuariosIcon} alt="" />, to: "/usuarios" },
  { label: "REPORTES", icon: <img src={reportesIcon} alt="" /> },
  { label: "CONFIGURACION", icon: <img src={configuracionIcon} alt="" /> },
];

const users = [
  { id: "01", initials: "AC", name: "Admin Chavez", mail: "admin.chavez@cauca.gov.co", role: "ADMIN", city: "Popayan", state: "ACTIVO", tone: "blue" },
  { id: "02", initials: "MR", name: "Maria Rios", mail: "m.rios@cauca.gov.co", role: "OPERADOR", city: "Santander Q.", state: "ACTIVO", tone: "green" },
  { id: "03", initials: "CM", name: "Carlos Medina", mail: "c.medina@cauca.gov.co", role: "OPERADOR", city: "Patia", state: "INACTIVO", tone: "orange" },
  { id: "04", initials: "LP", name: "Laura Penafiel", mail: "l.penafiel@cauca.gov.co", role: "ADMIN", city: "Timbio", state: "ACTIVO", tone: "blue" },
  { id: "05", initials: "JM", name: "Jorge Munoz", mail: "j.munoz@cauca.gov.co", role: "OPERADOR", city: "Bolivar", state: "ACTIVO", tone: "green" },
  { id: "06", initials: "AR", name: "Ana Rodriguez", mail: "a.rodriguez@cauca.gov.co", role: "OPERADOR", city: "Rosas", state: "ACTIVO", tone: "green" },
  { id: "07", initials: "PL", name: "Pedro Lemos", mail: "p.lemos@cauca.gov.co", role: "ADMIN", city: "Silvia", state: "INACTIVO", tone: "orange" },
  { id: "08", initials: "SR", name: "Sandra Ruiz", mail: "s.ruiz@cauca.gov.co", role: "OPERADOR", city: "Cajibio", state: "ACTIVO", tone: "green" },
] as const;

const activity = [
  { dot: "green", text: "Usuario creado: Sandra Ruiz", date: "Hoy 08:42" },
  { dot: "orange", text: "Rol modificado: Carlos Medina", date: "Ayer 16:30" },
  { dot: "red", text: "Cuenta suspendida: Pedro Lemos", date: "07/04 11:05" },
  { dot: "blue", text: "Acceso concedido: Maria Rios", date: "06/04 09:18" },
  { dot: "gray", text: "Contrasena restablecida: J. Munoz", date: "05/04 14:35" },
] as const;

export function UsersManagementPage() {
  const [selected, setSelected] = useState("USUARIOS");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const openCreateDrawer = () => {
    console.log("[UsersManagementPage] Click en '+ Crear usuario'");
    setIsCreateDrawerOpen(true);
  };

  const closeCreateDrawer = () => {
    console.log("[UsersManagementPage] Cerrar drawer de creacion de usuario");
    setIsCreateDrawerOpen(false);
  };

  const handleCreateUserSave = (payload: {
    cedula: string;
    nombreCompleto: string;
    emailInstitucional: string;
    telefono: string;
    nombreUsuario: string;
    rol: string;
    municipio: string;
  }) => {
    console.log("[UsersManagementPage] Guardar usuario", payload);
  };

  useEffect(() => {
    console.log("[UsersManagementPage] Drawer abierto:", isCreateDrawerOpen);
  }, [isCreateDrawerOpen]);

  return (
    <ManagementTemplate
      sidebarTitle="VIGIA CAUCA"
      sidebarSubtitle="GESTION INTEGRAL"
      sidebarNav={<NavMenu items={menuItems} selectedItem={selected} onItemSelect={setSelected} />}
      sidebarFooter={
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>AC</div>
          <div>
            <p className={styles.sidebarName}>Admin Chavez</p>
            <p className={styles.sidebarRole}>Administrador</p>
          </div>
        </div>
      }
      breadcrumb={<p className={styles.breadcrumbText}><strong>Dashboard</strong> / Gestion de Usuarios</p>}
      topbarUser={
        <>
          <div className={styles.topbarAvatar}>AC</div>
          <div>
            <p className={styles.topbarName}>Admin Chavez</p>
            <p className={styles.topbarRole}>Administrador</p>
          </div>
        </>
      }
      mainPanelClassName={styles.tablePanel}
      mainPanel={
        <>
          <div className={styles.tableToolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon} aria-hidden="true" />
              <input className={styles.searchInput} placeholder="Buscar usuario..." />
            </div>
            <span className={styles.counter}>8 usuarios</span>
            <Button type="button" className={styles.createBtn} onClick={openCreateDrawer}>
              + Crear usuario
            </Button>
          </div>

          <table className={styles.table}>
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
              {users.map((user) => (
                <tr key={user.id} className={styles[user.tone]}>
                  <td>{user.id}</td>
                  <td>
                    <div className={styles.nameCell}>
                      <span className={[styles.initial, styles[user.tone]].join(" ")}>{user.initials}</span>
                      {user.name}
                    </div>
                  </td>
                  <td className={styles.muted}>{user.mail}</td>
                  <td>
                    <span className={[styles.tag, user.role === "ADMIN" ? styles.adminTag : styles.operatorTag].join(" ")}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.city}</td>
                  <td>
                    <span className={[styles.tag, user.state === "ACTIVO" ? styles.activeTag : styles.inactiveTag].join(" ")}>
                      {user.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <footer className={styles.tableFooter}>Mostrando 8 de 8 usuarios · Pagina 1 de 1</footer>
        </>
      }
      rightPanelClassName={styles.rightPanel}
      rightPanel={
        <>
          <p className={styles.panelTitle}>Resumen · SYS-VIG-02</p>

          <div className={styles.metricsGrid}>
            <article className={[styles.metricBox, styles.metricBlue].join(" ")}>
              <strong>8</strong>
              <span>Total usuarios registrados</span>
            </article>
            <article className={[styles.metricBox, styles.metricGreen].join(" ")}>
              <strong>6</strong>
              <span>Activos en servicio</span>
            </article>
            <article className={[styles.metricBox, styles.metricGray].join(" ")}>
              <strong>2</strong>
              <span>Inactivos suspendidos</span>
            </article>
            <article className={[styles.metricBox, styles.metricPurple].join(" ")}>
              <strong>3</strong>
              <span>Admins con acceso total</span>
            </article>
          </div>

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>Distribucion por rol</h3>
            <div className={styles.progressGroup}>
              <div className={styles.progressLabelRow}><span>OPERADORES</span><span>5 / 8</span></div>
              <div className={styles.track}><span className={[styles.fill, styles.fillGreen].join(" ")} /></div>
            </div>
            <div className={styles.progressGroup}>
              <div className={styles.progressLabelRow}><span>ADMINISTRADORES</span><span>3 / 8</span></div>
              <div className={styles.track}><span className={[styles.fill, styles.fillBlue].join(" ")} /></div>
            </div>
          </section>

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>Actividad reciente</h3>
            <ul className={styles.activityList}>
              {activity.map((entry) => (
                <li key={entry.text} className={styles.activityItem}>
                  <span className={[styles.dot, styles[entry.dot]].join(" ")} aria-hidden="true" />
                  <div>
                    <p className={styles.activityText}>{entry.text}</p>
                    <p className={styles.activityDate}>{entry.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      }
      overlay={
        isCreateDrawerOpen ? (
          <CreateUserDrawer
            open={isCreateDrawerOpen}
            onClose={closeCreateDrawer}
            existingEmails={users.map((user) => user.mail)}
            onSave={handleCreateUserSave}
          />
        ) : null
      }
    />
  );
}