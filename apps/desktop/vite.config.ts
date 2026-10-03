import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/renderer'),
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: {
      '@jarvis/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@jarvis/security': path.resolve(__dirname, '../../packages/security/src'),
      '@jarvis/voice': path.resolve(__dirname, '../../packages/voice/src'),
      '@jarvis/tools': path.resolve(__dirname, '../../packages/tools/src'),
      '@jarvis/agent': path.resolve(__dirname, '../../packages/agent/src'),
      '@jarvis/ai': path.resolve(__dirname, '../../packages/ai/src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});

