import { useState } from "react";
import type { ReactNode } from "react";
import { NavItem } from "../atoms/NavItem";
import styles from "./NavMenu.module.css";

export interface NavMenuProps {
  items: Array<{ label: string; icon?: ReactNode }>;
  selectedItem?: string;
  onItemSelect?: (label: string) => void;
}

export function NavMenu({ items, selectedItem: initialSelected = "", onItemSelect }: NavMenuProps) {
  const [selectedItem, setSelectedItem] = useState(initialSelected);

  const handleItemClick = (label: string) => {
    setSelectedItem(label);
    onItemSelect?.(label);
  };

  return (
    <nav className={styles.navMenu} aria-label="Navegacion principal">
      <ul className={styles.navList}>
        {items.map((item) => (
          <li key={item.label} className={styles.navListItem}>
            <NavItem
              label={item.label}
              icon={item.icon}
              isSelected={selectedItem === item.label}
              onClick={() => handleItemClick(item.label)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
