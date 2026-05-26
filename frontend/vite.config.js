// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the SupportDesk React application
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Serve the frontend locally on port 3000
    host: true, // Allow hosting on local network
  },
});
