module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'react',
  ],
  rules: {
    "react/prop-types": ["error", { "ignore": ["navigation"] }],
    "no-underscore-dangle": [2, { "allow": ["_id"] }],
    "arrow-parens": ["error", "as-needed"],
    "react/sort-comp": [1, {
      order: [
        "static-variables",
        "instance-variables",
        "constructor",
        "static-methods",
        "lifecycle",
        "everything-else",
        "render",
      ]
    }]
  },
};


