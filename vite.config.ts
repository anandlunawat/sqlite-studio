import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@sqlite.org/sqlite-wasm/dist/*.wasm',
          dest: '' // Copy wasm files to the root of dist
        },
        {
          src: 'node_modules/@sqlite.org/sqlite-wasm/dist/sqlite3-worker1-bundler-friendly.js',
          dest: '' // Copy worker script to root of dist
        }
      ]
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: '[name][extname]', // Prevent .wasm hash renaming
      }
    }
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  }
});
