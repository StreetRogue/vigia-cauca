import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const gatewayUrl = env.VITE_API_GATEWAY_URL || 'http://localhost:8080';
  const novedadesUrl = env.VITE_API_NOVEDADES_URL || 'http://localhost:5003';
  const reportesUrl = env.VITE_API_REPORTES_URL || 'http://localhost:5004';
  const ubicacionesUrl = env.VITE_API_UBICACIONES_URL || 'http://localhost:8082';
  const apiMode = env.VITE_API_MODE || 'direct';

  const proxy =
    apiMode === 'gateway'
      ? {
          '/api': {
            target: gatewayUrl,
            changeOrigin: true,
            secure: false,
          },
        }
      : {
          '/api/v1/microNovedades': {
            target: novedadesUrl,
            changeOrigin: true,
            secure: false,
          },
          '/api/v1/reportes': {
            target: reportesUrl,
            changeOrigin: true,
            secure: false,
          },
          '/api/v1/microUbicaciones': {
            target: ubicacionesUrl,
            changeOrigin: true,
            secure: false,
          },
        };

  return {
    plugins: [react()],
    server: {
      proxy,
    },
  };
});
