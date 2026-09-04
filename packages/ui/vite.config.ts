import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [react(), dts({ include: ['src'], rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Never bundle React or the Radix primitives — consumers own those.
      external: (id) =>
        id === 'react' ||
        id === 'react-dom' ||
        id.startsWith('react/') ||
        id.startsWith('react-dom/') ||
        id.startsWith('@radix-ui/') ||
        id === 'lucide-react' ||
        id === 'clsx' ||
        id === 'tailwind-merge' ||
        id === 'class-variance-authority',
    },
    sourcemap: true,
    target: 'es2022',
  },
})
