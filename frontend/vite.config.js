import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from 'vite-plugin-remove-console';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    removeConsole()
  ],
  server: {
    watch: {
      usePolling: true,
    },
    host: '0.0.0.0',  // Make sure Vite listens on all interfaces
    port: 5173,        // Ensure the correct port
  },
})
