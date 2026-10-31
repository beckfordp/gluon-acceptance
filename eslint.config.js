import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '.features-gen',
      'playwright-report',
      'test-results',
      'blob-report',
      'coverage',
      'node_modules',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.node,
    },
    plugins: { '@stylistic': stylistic },
    rules: {
      // Style guide: explicit semicolons, no reliance on ASI.
      '@stylistic/semi': ['error', 'always'],
    },
  },
)
