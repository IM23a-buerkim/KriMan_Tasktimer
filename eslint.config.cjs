module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    plugins: {},
    extends: ['eslint:recommended', 'prettier'],
    rules: {
      'no-unused-vars': ['warn'],
      'no-console': 'off',
    },
  },
];
