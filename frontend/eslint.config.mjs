import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Allow using `any` where needed in this project
      "@typescript-eslint/no-explicit-any": "off",
      // Our effects intentionally set state from local storage / SignalR
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "error",
      // Allow setState inside effects for this dashboard-style app
      "react-hooks/set-state-in-effect": "off",
      // Keep unused vars as warnings only (for icons, etc.)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
]);

export default eslintConfig;
