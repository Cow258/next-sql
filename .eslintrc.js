module.exports = {
  parser: 'babel-eslint',
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  plugins: ['import'],
  globals: {
    window: false,
  },
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
    'func-names': 0,
    'max-len': 0,
    'no-continue': 0,
    camelcase: 0,
    'no-console': 1,
    'no-underscore-dangle': 0,
    'linebreak-style': ['off', 'windows'],
    'import/prefer-default-export': 0,
    'no-param-reassign': 0,
    'object-curly-newline': 0,
    'class-methods-use-this': 0,
    'new-cap': 0,
    'guard-for-in': 0,
    'no-restricted-syntax': ['error', 'WithStatement'],
    'no-plusplus': 0,
    'no-irregular-whitespace': 0,
    'default-case': 0,
    'no-restricted-properties': 0,
    eqeqeq: 1,
    radix: 0,
    'arrow-parens': 0,
    'consistent-return': 0,
    'prefer-rest-params': 0,
    'no-script-url': 0,
    'import/newline-after-import': 0,
    'operator-linebreak': 0,
    'max-classes-per-file': 0,
    semi: ['error', 'never'],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    quotes: ['error', 'single'],
    'quote-props': ['error', 'as-needed'],
    'eol-last': ['error', 'always'],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.json'],
        moduleDirectory: ['node_modules', './'],
      },
    },
  },
}
