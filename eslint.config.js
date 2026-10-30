import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist', 'eslint.config.js'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        React: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        setTimeout: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        MouseEvent: 'readonly',
        Node: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-case-declarations': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
