import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // Forward all /stayvora-backend requests to Apache/XAMPP on port 80.
      // This makes API calls same-origin, so the session cookie
      // (SameSite=Lax) is sent automatically on every request.
      '/stayvora-backend': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:80',
        changeOrigin: true,
      },
    },
  },
});