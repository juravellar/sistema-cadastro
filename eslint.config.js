const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: ["frontend/**", "**/node_modules/**", "**/dist/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js", "backend/bin/www"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^(_|next$)" }],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
    },
  },
];
