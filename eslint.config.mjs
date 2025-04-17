// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "prettier/prettier": ["warn", { "endOfLine": "crlf" }],
      '@typescript-eslint/no-explicit-any': 'warn',         // Warn about 'any' usage
      '@typescript-eslint/no-floating-promises': 'warn',   // Enforce promise handling
      '@typescript-eslint/no-unsafe-argument': 'error',     // Enforce type-safe arguments

    },
  },
);