import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/tokens.css";
import "./styles/base.css";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

// Debug: mostrar información de sesión al cargar
const token = localStorage.getItem('kc-token');
const role = localStorage.getItem('kc-role');
if (token) {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║          🔍 INFORMACIÓN COMPLETA DEL JWT              ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('[SESIÓN] Rol en localStorage:', role);
    console.log('[SESIÓN] Sub:', decoded.sub);
    console.log('[SESIÓN] Preferred username:', decoded.preferred_username);
    console.log('[SESIÓN] realm_access:', JSON.stringify(decoded.realm_access, null, 2));
    console.log('[SESIÓN] resource_access:', JSON.stringify(decoded.resource_access, null, 2));
    console.log('[SESIÓN] roles (directo):', decoded.roles);
    console.log('═══════════════════════════════════════════════════════');
  } catch (e) {
    console.log('[SESIÓN] Error al decodificar token:', e);
  }
} else {
  console.log('[SESIÓN] ⚠️  NO hay token en localStorage');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
