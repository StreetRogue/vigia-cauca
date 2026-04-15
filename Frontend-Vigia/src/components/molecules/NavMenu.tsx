import { useState } from 'react';
import { NavItem } from '../atoms/NavItem';
import { MdDashboard, MdReport, MdSettings, MdPeople } from 'react-icons/md';
import { FaRegNewspaper } from 'react-icons/fa';

export function NavMenu() {
  const [selectedItem, setSelectedItem] = useState('DASHBOARD');

  const menuItems = [
    { label: 'DASHBOARD', icon: MdDashboard },
    { label: 'NOVEDADES', icon: FaRegNewspaper },
    { label: 'USUARIOS', icon: MdPeople },
    { label: 'REPORTES', icon: MdReport },
    { label: 'CONFIGURACION', icon: MdSettings },
  ];

  return (
    <nav className="nav-menu">
      <ul className="nav-list">
        {menuItems.map((item) => (
          <li key={item.label}>
            <NavItem
              label={item.label}
              icon={item.icon}
              isSelected={selectedItem === item.label}
              onClick={() => setSelectedItem(item.label)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
