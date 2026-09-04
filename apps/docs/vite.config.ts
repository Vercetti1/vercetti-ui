import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Honour an assigned PORT so the dev server can coexist with whatever
    // else is already holding 5173.
    port: Number(process.env.PORT) || 5173,
  },
  resolve: {
    alias: [
      {
        // Anchored so it matches the bare specifier only. A plain string alias
        // is a prefix match, which also rewrites '@vercetti/ui/tokens.css' into
        // '<...>/index.ts/tokens.css' and breaks the CSS import.
        find: /^@vercetti\/ui$/,
        // Point at library source rather than dist so docs get hot reload
        // while editing components. Consumers still resolve via the exports map.
        replacement: resolve(import.meta.dirname, '../../packages/ui/src/index.ts'),
      },
    ],
  },
})
