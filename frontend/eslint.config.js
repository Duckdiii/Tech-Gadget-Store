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
      // Same React Compiler readiness family as above. It flags Math.random()/Date.now() calls
      // inside any function nested in a component body, even ones only reachable from onClick —
      // it can't prove the call site is event-handler-only, not render-path. See
      // PromotionFormModal.jsx's handleGenerateCode, invoked solely via onClick.
      'react-hooks/purity': 'off',
    },
  },
  {
    // playwright.config.js + e2e/ chạy trong Node (Playwright test runner), không phải browser —
    // cần globals.node thay vì globals.browser, và không áp rule React (không liên quan).
    files: ['playwright.config.js', 'e2e/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
])
