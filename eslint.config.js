import js from '@eslint/js';
import typescriptESLint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['dist', 'eslint.config.js'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescriptESLint,
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    extends: [
      js.configs.recommended,
      ...typescriptESLint.configs.recommended,
      pluginReact.configs.recommended,
      pluginReactHooks.configs.recommended,
    ],
    rules: {
      // Override or add rules here
      'react/react-in-jsx-scope': 'off',
    },
  },
];