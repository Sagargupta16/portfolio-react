import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
   {
      ignores: ["build/**", "dist/**", "node_modules/**", "scripts/**"],
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
         react,
         "react-hooks": reactHooks,
         "react-refresh": reactRefresh,
         "jsx-a11y": jsxA11y,
      },
      rules: {
         ...react.configs.recommended.rules,
         ...react.configs["jsx-runtime"].rules,
         ...reactHooks.configs.recommended.rules,
         ...jsxA11y.configs.recommended.rules,
         "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
         ],
         "react/prop-types": "off",
         "react/no-unescaped-entities": "off",
         "no-unused-vars": "off",
         "@typescript-eslint/no-unused-vars": [
            "error",
            {
               argsIgnorePattern: "^_",
            },
         ],
      },
      settings: {
         react: {
            version: "detect",
         },
      },
   },
];
