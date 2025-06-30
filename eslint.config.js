import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './tsconfig.app.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Enforce absolute imports - CRITICAL RULES
      'import/no-relative-packages': 'error', // Prevents relative imports to packages
      'import/no-useless-path-segments': 'error', // Prevents redundant path segments
      'import/first': 'error', // Ensures imports come first
      'import/newline-after-import': 'error', // Requires newline after imports
      'import/no-duplicates': 'error', // Prevents duplicate imports

      // Custom rule: Allow @/ imports but prevent ../ parent directory imports
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message:
                'Use absolute imports with @/ alias instead of relative parent directory imports (../)',
            },
          ],
        },
      ],
    },
  }
);
