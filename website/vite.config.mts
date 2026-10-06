import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import scopeStyle from 'babel-preset-react-scope-style/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ command }) => ({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/formula-calc/',
  esbuild: command === 'serve'
    ? { target: 'chrome122' }
    : undefined,
  optimizeDeps: {
    esbuildOptions: { target: 'chrome122' }
  },
  plugins: [
    scopeStyle({ scopePrefix: 'fc-', scopeNamespace: 'playground' }),
    legacy({ targets: ['Chrome >= 49'] })
  ],
  resolve: {
    alias: [{
      find: /^@ant-design\/icons\/lib\/dist$/,
      replacement: fileURLToPath(new URL('./src/icons.ts', import.meta.url))
    }]
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
    outDir: '../dist-website',
    emptyOutDir: true,
    cssTarget: 'chrome49'
  },
  css: {
    postcss: {
      plugins: [{
        postcssPlugin: 'chrome49-antd-wave-fallback',
        Declaration(declaration) {
          // Ant Design 3 already emits fixed-color wave fallbacks before its dynamic CSS variable declarations.
          if (declaration.value.includes('var(--antd-wave-shadow-color)')) declaration.remove();
        },
      }]
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  preview: {
    host: '127.0.0.1',
    port: 4173
  },
}));
