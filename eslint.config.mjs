import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { globals: {...globals.browser, ...globals.node} } 
  },
  // .js files are CommonJS (default in package.json with "type": "commonjs")
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  // .mjs files are ESM modules
  { files: ["**/*.mjs"], languageOptions: { sourceType: "module" } },
  // .cjs files are explicitly CommonJS
  { files: ["**/*.cjs"], languageOptions: { sourceType: "commonjs" } },
]);
