import type { ReactNode } from "react";
import escudoCauca from "../../assets/imgs/escudo-cauca.png";
import { useSidebar } from "../../context/SidebarContext";
import styles from "./Sidebar.module.css";

export interface SidebarProps {
  title: string;
  subtitle: string;
  nav?: ReactNode;
  footer?: ReactNode;
}

export function Sidebar({ title, subtitle, nav, footer }: SidebarProps) {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={[styles.sidebar, collapsed ? styles.collapsed : ""].filter(Boolean).join(" ")}
      aria-hidden={collapsed ? undefined : undefined}
    >
      <div className={styles.sidebarGrid} aria-hidden="true" />

      <div className={styles.sidebarHeader}>
        <img src={escudoCauca} alt="" aria-hidden="true" className={styles.markBox} />
        <div className={styles.sidebarHeading}>
          <h1 className={styles.sidebarTitle}>{title}</h1>
          <span className={styles.sidebarSubtitle}>{subtitle}</span>
        </div>
      </div>

      {nav ? <div className={styles.sidebarContent}>{nav}</div> : null}

      <div className={styles.institutionalBlock}>
        <span className={styles.institutionalRule} aria-hidden="true" />
      </div>

      {footer ? <div className={styles.sidebarFooter}>{footer}</div> : null}
    </aside>
  );
}
