module.exports = {
	root: true,
	extends: [
		'@react-native',
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
	],
	plugins: ['react', 'react-hooks', '@typescript-eslint'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	env: {
		es6: true,
		node: true,
		'react-native/react-native': true,
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	rules: {
		// React Hooks Rules - CRITICAL for preventing crashes
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',

		// React Rules
		'react/prop-types': 'off', // Using TypeScript instead
		'react/react-in-jsx-scope': 'off', // Not needed in React 17+
		'react/display-name': 'warn',
		'react/no-unescaped-entities': 'warn',
		'react/no-unused-state': 'warn',
		'react/no-will-update-set-state': 'error',
		'react/prefer-stateless-function': 'warn',

		// TypeScript Rules
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-empty-function': 'warn',
		'@typescript-eslint/prefer-const': 'error',

		// General JavaScript/TypeScript Rules
		'no-console': 'warn',
		'no-debugger': 'error',
		'no-unused-vars': 'off', // Using TypeScript version instead
		'no-undef': 'error',
		'no-var': 'error',
		'prefer-const': 'error',
		'no-const-assign': 'error',
		'no-dupe-keys': 'error',
		'no-dupe-args': 'error',
		'no-dupe-class-members': 'error',
		'no-dupe-else-if': 'error',
		'no-duplicate-imports': 'error',
		'no-func-assign': 'error',
		'no-import-assign': 'error',
		'no-obj-calls': 'error',
		'no-redeclare': 'error',
		'no-setter-return': 'error',
		'no-sparse-arrays': 'error',
		'no-unreachable': 'error',
		'no-unsafe-negation': 'error',
		'valid-typeof': 'error',

		// Code Quality
		eqeqeq: ['error', 'always'],
		curly: ['error', 'all'],
		'brace-style': ['error', '1tbs'],
		'comma-dangle': ['error', 'always-multiline'],
		'comma-spacing': 'error',
		'comma-style': 'error',
		indent: ['error', 2, { SwitchCase: 1 }],
		'key-spacing': 'error',
		'keyword-spacing': 'error',
		'object-curly-spacing': ['error', 'always'],
		semi: ['error', 'always'],
		'semi-spacing': 'error',
		'space-before-blocks': 'error',
		'space-before-function-paren': ['error', 'never'],
		'space-in-parens': ['error', 'never'],
		'space-infix-ops': 'error',
		'space-unary-ops': 'error',
		quotes: ['error', 'single', { avoidEscape: true }],
	},
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			rules: {
				// TypeScript specific overrides
				'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			},
		},
	],
	ignorePatterns: [
		'node_modules/',
		'android/',
		'ios/',
		'.expo/',
		'dist/',
		'build/',
		'*.config.js',
		'metro.config.js',
		'babel.config.js',
	],
};
