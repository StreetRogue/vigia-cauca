import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, UsersManagementPage } from "./pages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/usuarios" element={<UsersManagementPage />} />
    </Routes>
  );
}

export default App;