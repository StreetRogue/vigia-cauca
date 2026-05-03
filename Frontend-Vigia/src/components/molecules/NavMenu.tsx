import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavItem } from "../atoms/NavItem";
import styles from "./NavMenu.module.css";

export interface NavMenuProps {
  items: Array<{ label: string; icon?: ReactNode; to?: string }>;
  selectedItem?: string;
  onItemSelect?: (label: string) => void;
}

export function NavMenu({ items, selectedItem, onItemSelect }: NavMenuProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const resolveSelected = () => {
    // Priority 1: match by current URL path
    const byRoute = items.find((item) => item.to && pathname.startsWith(item.to));
    if (byRoute) return byRoute.label;
    // Priority 2: controlled selectedItem prop
    if (selectedItem) return selectedItem;
    return "";
  };

  const activeLabel = resolveSelected();

  const handleClick = (label: string, to?: string) => {
    onItemSelect?.(label);
    if (to) navigate(to);
  };

  return (
    <nav className={styles.navMenu} aria-label="Navegacion principal">
      <ul className={styles.navList}>
        {items.map((item) => (
          <li key={item.label} className={styles.navListItem}>
            <NavItem
              label={item.label}
              icon={item.icon}
              isSelected={activeLabel === item.label}
              onClick={() => handleClick(item.label, item.to)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
