import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configure base for GitHub Pages under /satelitetracker/
export default defineConfig({
  base: '/satelitetracker/',
  plugins: [react()],
});