import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core/'),
      '@presentation': path.resolve(__dirname, 'src/presentation/'),
      '@atoms': path.resolve(__dirname, 'src/presentation/atoms/'),
      '@molecules': path.resolve(__dirname, 'src/presentation/molecules/'),
      '@organisms': path.resolve(__dirname, 'src/presentation/organisms/'),
      '@templates': path.resolve(__dirname, 'src/presentation/templates/'),
      '@pages': path.resolve(__dirname, 'src/presentation/pages/'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure/'),
      '@shared': path.resolve(__dirname, 'src/shared/'),
      '@hooks': path.resolve(__dirname, 'src/shared/hooks/'),
      '@utils': path.resolve(__dirname, 'src/shared/utils/'),
      '@styles': path.resolve(__dirname, 'src/shared/styles/'),
    },
  },
});
