import type { ReactNode } from "react";
import { useSidebar } from "../../context/SidebarContext";
import styles from "./NavItem.module.css";

interface NavItemProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

export function NavItem({ label, isSelected, onClick, icon }: NavItemProps) {
  const { collapsed } = useSidebar();

  return (
    <button
      className={[styles.navItem, isSelected ? styles.selected : "", collapsed ? styles.compact : ""]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      type="button"
      aria-current={isSelected ? "page" : undefined}
      // Recogida solo quedan los iconos: el nombre se conserva como
      // etiqueta accesible y como tooltip nativo.
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
    >
      <span className={styles.navIcon} aria-hidden="true">{icon}</span>
      <span className={styles.navLabel}>{label}</span>
    </button>
  );
}
