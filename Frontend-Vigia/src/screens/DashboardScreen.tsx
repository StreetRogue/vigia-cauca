import { Sidebar } from '../components/organisms/Sidebar';

export function DashboardScreen() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
          <h2>Panel de Control</h2>
        </header>
        <section className="content-area">
          <p>Bienvenido al sistema de estadísticas de seguridad.</p>
        </section>
      </main>
    </div>
  );
}
