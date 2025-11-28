import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: ['dist/*', 'node_modules/*'],
    coverage: {
      provider: 'v8',
      enabled: true,
      reportsDirectory: './reports/tests/coverage'
    },
  },
})
