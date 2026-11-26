import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'

// Tests use only the plugins they need. The app's TanStack Start and devtools plugins
// make Vitest load a second React instance for components that call hooks directly.
export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] }), viteReact()],
})
