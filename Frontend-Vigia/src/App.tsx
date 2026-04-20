import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, UsersManagementPage } from "./pages";
import { NovedadesScreen } from "./screens/NovedadesScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/usuarios" element={<UsersManagementPage />} />
      <Route path="/novedades" element={<NovedadesScreen />} />
    </Routes>
  );
}

export default App;
