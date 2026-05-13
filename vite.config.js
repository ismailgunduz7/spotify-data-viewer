import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    // Strip Vue dev-only flags from the production bundle.
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    __VUE_OPTIONS_API__: false,
  },
  build: {
    sourcemap: false,
    cssMinify: true,
    reportCompressedSize: false,
    // Vite 8 uses rolldown + oxc by default; oxc drops console/debugger when enabled below.
    minify: true,
  },
  oxc: {
    jsx: undefined,
    transform: {
      // Strip console.* and debugger statements in production bundles.
      drop: ['console', 'debugger'],
      legalComments: 'none',
    },
  },
})
