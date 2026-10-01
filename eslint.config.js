export default [
  { ignores: ["dist/**", "node_modules/**", ".runtime/**", ".beads/**"] },
  {
    files: ["**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    rules: { "no-unused-vars": "error", "no-constant-condition": "error" },
  },
];
