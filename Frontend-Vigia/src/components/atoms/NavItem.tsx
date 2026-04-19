import type { ReactNode } from "react";
import styles from "./NavItem.module.css";

interface NavItemProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

export function NavItem({ label, isSelected, onClick, icon }: NavItemProps) {
  return (
    <button
      className={[styles.navItem, isSelected ? styles.selected : ""].filter(Boolean).join(" ")}
      onClick={onClick}
      type="button"
      aria-current={isSelected ? "page" : undefined}
    >
      <span className={styles.navIcon} aria-hidden="true">{icon}</span>
      <span className={styles.navLabel}>{label}</span>
    </button>
  );
}
