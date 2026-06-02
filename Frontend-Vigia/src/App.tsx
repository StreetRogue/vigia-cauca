import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, UsersManagementPage, SettingsPage } from "./pages";
import { NovedadesScreen } from "./screens/NovedadesScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { EstadisticasScreen } from "./screens/EstadisticasScreen";
import { useAuth } from "./context/AuthContext";
import type { JSX } from "react";

function RequireRole({ roles, children }: { roles: string[]; children: JSX.Element }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate replace to="/login" />;
  if (!roles.includes(user?.rol ?? "")) return <Navigate replace to="/dashboard" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/dashboard" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardScreen />} />
      {/* Estadísticas: accesible para todos (HU-3.1 a 3.5 incluye Visitante) */}
      <Route path="/estadisticas" element={<EstadisticasScreen />} />
      <Route
        path="/usuarios"
        element={
          <RequireRole roles={["ADMIN"]}>
            <UsersManagementPage />
          </RequireRole>
        }
      />
      <Route
        path="/novedades"
        element={
          <RequireRole roles={["ADMIN", "OPERADOR"]}>
            <NovedadesScreen />
          </RequireRole>
        }
      />
      <Route
        path="/configuracion"
        element={
          <RequireRole roles={["ADMIN", "OPERADOR"]}>
            <SettingsPage />
          </RequireRole>
        }
      />
    </Routes>
  );
}

export default App;
