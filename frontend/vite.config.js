// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Asegúrate de que sea el puerto de Uvicorn/FastAPI
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
