import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, UsersManagementPage } from "./pages";
import { NovedadesScreen } from "./screens/NovedadesScreen";
import { DashboardScreen } from "./screens/DashboardScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/dashboard" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardScreen />} />
      <Route path="/usuarios" element={<UsersManagementPage />} />
      <Route path="/novedades" element={<NovedadesScreen />} />
    </Routes>
  );
}

export default App;
