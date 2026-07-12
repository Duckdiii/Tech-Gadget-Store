import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // React Compiler readiness rule bundled into "recommended" as of eslint-plugin-react-hooks v6.
      // It flags the standard "fetch on mount" pattern (setLoading(true) before an await) used
      // throughout this codebase's data-fetching hooks, which is idiomatic and not a bug — see
      // https://react.dev/reference/react/useEffect#fetching-data-with-effects. Disabled rather than
      // rewriting ~20 working hooks to dodge a compiler-compatibility rule this app doesn't need yet.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
