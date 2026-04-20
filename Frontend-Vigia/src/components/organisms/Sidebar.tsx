import { NavMenu } from '../molecules/NavMenu';
import { UserCard } from '../molecules/UserCard';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">VIGIA CAUCA</h1>
        <span className="sidebar-subtitle">GESTION INTEGRAL</span>
      </div>
      <div className="sidebar-content">
        <NavMenu />
      </div>
      <div className="sidebar-footer">
        <UserCard name="Actual_user" role="Admin Rol" />
      </div>
    </aside>
  );
}
