module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    'jest/globals': true,
  },
  globals: {
    page: 'readonly',
    JSX: true,
  },
  // https://typescript-eslint.io/docs/linting/
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react', 
    'react-hooks', 
    '@typescript-eslint', 
    'jest'
  ],
  extends: [
    'plugin:react/recommended', 
    'airbnb'
  ],
  //
  rules: {
    // Stylistic
    'semi': 'warn',
    'comma-dangle': ['warn', {
      arrays: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'never',
      objects: 'always-multiline',
    }],
    'quotes': ['warn', 'single'],
    'no-multiple-empty-lines': 'warn',
    'jsx-quotes': ['error', 'prefer-double'],
    'react/jsx-curly-brace-presence': 'warn',
    // Space efficiency
    'no-trailing-spaces': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn'],
    // Other (to categorize)
    'max-classes-per-file': 0,
    'react/jsx-filename-extension': ['error', {
      extensions: ['.ts', '.tsx'],
    }],
    'no-continue': 0,
    'import/extensions': 0,
    'newline-per-chained-call': 0,
    'no-use-before-define': 0,
    '@typescript-eslint/no-use-before-define': 'error',
    'import/prefer-default-export': 0,
    'no-unused-vars': 0,
    'react/jsx-props-no-spreading': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'consistent-return': 0,
    'linebreak-style': 0,
    'no-param-reassign': 0,
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
    'max-len': 0,
    'react/no-array-index-key': 0,
    'no-mixed-operators': 0,
    'operator-linebreak': 0,
    'import/no-mutable-exports': 0,
    'no-underscore-dangle': 0,
    // 
    'import/no-extraneous-dependencies': 0,
    'implicit-arrow-linebreak': 0,
    'object-curly-newline': 0,
    'function-paren-newline': 0,
    'indent': 0,
    'react/prop-types': 0,
    'prefer-destructuring': 0,
    'react/destructuring-assignment': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-closing-bracket-location': 0,
    'react/jsx-curly-newline': 0,
    'no-nested-ternary': 0,
    'react/jsx-wrap-multilines': 0,
    'no-await-in-loop': 0,
    'no-restricted-syntax': [
      'error',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement',
    ],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-extra-non-null-assertion': ['error'],
    'no-console': 'off',
    'object-shorthand': 0,
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
