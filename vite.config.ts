import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)))
const rawBasePath = process.env.VITE_BASE_PATH?.trim()
const normalizedBasePath = !rawBasePath || rawBasePath === '/'
  ? '/'
  : `/${rawBasePath.replace(/^\/+|\/+$/g, '')}/`

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  // Default to a root deploy for Vercel, but allow an override for subpath hosting.
  base: normalizedBasePath,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'jotai'],
          'vendor-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-toolbar',
            '@radix-ui/react-tooltip',
            'framer-motion',
          ],
        }
      }
    }
  }
})
