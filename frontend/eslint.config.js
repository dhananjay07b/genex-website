import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // buttonVariants is a style helper shared with <Link>s, kept beside <Button>.
      'react-refresh/only-export-components': ['error', { allowConstantExport: true, allowExportNames: ['buttonVariants'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    },
  },
  {
    // The route table defines its lazy pages and exports the router; hot reload doesn't apply to it.
    files: ['src/router.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
