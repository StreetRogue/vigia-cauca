import { IconType } from 'react-icons';

interface NavItemProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: IconType;
}

export function NavItem({ label, isSelected, onClick, icon: Icon }: NavItemProps) {
  return (
    <button
      className={`nav-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {Icon && <Icon className="nav-icon" />}
      <span className="nav-label">{label}</span>
    </button>
  );
}
