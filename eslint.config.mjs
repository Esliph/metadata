import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  eslintPluginPrettierRecommended,
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  {
    files: ['**/*.{js,ts,mjs}'],
    rules: {
      indent: ['off', 'spaces', 2],
      'linebreak-style': ['off', 'windows'],
      quotes: ['warn', 'single'],
      semi: ['warn', 'never'],
      curly: ['warn', 'multi-line'],
      eqeqeq: 'off',
      'no-trailing-spaces': 'warn',
      'no-multiple-empty-lines': 'off',
      'no-inline-comments': 'off',
      'no-explicit-any': 'off',
      'prefer-const': 'off',
      'import/prefer-default-export': 'off',
      'no-inner-declarations': 'off',
      'no-empty-pattern': 'off',
      'no-prototype-builtins': 'off',
      camelcase: 'warn',
      'no-tabs': ['error', { allowIndentationTabs: true }],
      'prettier/prettier': ['off', { endOfLine: 'auto' }],
      'no-async-promise-executor': 'off',
      'no-constant-condition': 'warn',
      'no-empty': 'warn',
      'no-unused-expressions': ['warn', { allowTaggedTemplates: true }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
)
