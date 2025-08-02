module.exports = {
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    node: true,
    es6: true
  },
  rules: {
    'prettier/prettier': 'error'
  }
}; 