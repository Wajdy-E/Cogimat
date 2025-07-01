import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";

export default [
	js.configs.recommended,
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
				ecmaVersion: 2020,
				sourceType: "module",
			},
			globals: {
				console: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
				require: "readonly",
				process: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				global: "readonly",
				Buffer: "readonly",
				alert: "readonly",
				fetch: "readonly",
				FileReader: "readonly",
				document: "readonly",
				window: "readonly",
				HTMLDivElement: "readonly",
				HTMLHeadingElement: "readonly",
				HTMLTableElement: "readonly",
				HTMLTableSectionElement: "readonly",
				HTMLTableCellElement: "readonly",
				HTMLTableRowElement: "readonly",
				HTMLTableCaptionElement: "readonly",
			},
		},
		plugins: {
			react,
			"react-hooks": reactHooks,
			"@typescript-eslint": tseslint,
			"unused-imports": unusedImports,
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			// React Hooks Rules - CRITICAL for preventing crashes
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",

			// React Rules
			"react/jsx-uses-react": "off",
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off", // Using TypeScript instead
			"react/display-name": "warn",
			"react/no-unescaped-entities": "warn",
			"react/no-unused-state": "warn",
			"react/no-will-update-set-state": "error",
			"react/prefer-stateless-function": "warn",

			// TypeScript Rules
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-empty-function": "off",

			// General JavaScript/TypeScript Rules
			"no-console": "off",
			"no-debugger": "error",
			"no-unused-vars": "off", // Using TypeScript version instead
			"no-undef": "error",
			"no-var": "error",
			"prefer-const": "error",
			"no-const-assign": "error",
			"no-dupe-keys": "error",
			"no-dupe-args": "error",
			"no-dupe-class-members": "error",
			"no-dupe-else-if": "error",
			"no-duplicate-imports": "error",
			"no-func-assign": "error",
			"no-import-assign": "error",
			"no-obj-calls": "error",
			"no-redeclare": "error",
			"no-setter-return": "error",
			"no-sparse-arrays": "error",
			"no-unreachable": "error",
			"no-unsafe-negation": "error",
			"valid-typeof": "error",

			// Code Quality
			eqeqeq: ["error", "always"],
			curly: ["error", "all"],
			"brace-style": ["error", "1tbs"],
			"comma-dangle": ["error", "always-multiline"],
			"comma-spacing": "error",
			"comma-style": "error",
			indent: ["error", "tab", { SwitchCase: 1 }],
			"key-spacing": "error",
			"keyword-spacing": "error",
			"object-curly-spacing": ["error", "always"],
			semi: ["error", "always"],
			"semi-spacing": "error",
			"space-before-blocks": "error",
			"space-before-function-paren": ["error", "always"],
			"space-in-parens": "error",
			"space-infix-ops": "error",
			"space-unary-ops": "error",
			quotes: ["error", "single"],

			// Unused Imports
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{
					vars: "all",
					varsIgnorePattern: "^_",
					args: "after-used",
					argsIgnorePattern: "^_",
				},
			],
		},
	},
	{
		ignores: [
			"node_modules/",
			"android/",
			"ios/",
			".expo/",
			"dist/",
			"build/",
			"*.config.js",
			"metro.config.js",
			"babel.config.js",
		],
	},
];
