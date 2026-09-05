import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y-x";

export default [
   {
      ignores: ["build/**", "dist/**", "node_modules/**"],
   },
   js.configs.recommended,
   ...tseslint.configs.recommended,
   {
      files: ["**/*.{js,jsx,ts,tsx}"],
      languageOptions: {
         ecmaVersion: 2024,
         sourceType: "module",
         parserOptions: {
            ecmaFeatures: {
               jsx: true,
            },
         },
         globals: {
            ...globals.browser,
            React: "readonly",
         },
      },
      plugins: {
         ...react.configs["recommended-typescript"].plugins,
         "react-hooks": reactHooks,
         "react-refresh": reactRefresh,
         "jsx-a11y-x": jsxA11y,
      },
      rules: {
         ...react.configs["recommended-typescript"].rules,
         ...reactHooks.configs.recommended.rules,
         ...jsxA11y.configs.recommended.rules,
         "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
         ],
         "no-unused-vars": "off",
         "@typescript-eslint/no-unused-vars": [
            "error",
            {
               argsIgnorePattern: "^_",
            },
         ],
      },
      settings: {
         ...react.configs["recommended-typescript"].settings,
      },
   },
   {
      files: ["scripts/**/*.js"],
      languageOptions: {
         globals: {
            ...globals.node,
         },
      },
      rules: {
         "react-refresh/only-export-components": "off",
      },
   },
];
