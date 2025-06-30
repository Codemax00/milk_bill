import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/milk_bill/',
  build: {
    outDir: 'docs'
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}); 