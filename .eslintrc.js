module.exports = {
	extends: [
		'@stimulcross/eslint-config-node',
		'@stimulcross/eslint-config-typescript',
		'@stimulcross/eslint-config-typescript/style'
	],
	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		ecmaVersion: 'latest'
	},
	root: true,
	env: {
		node: true,
		jest: true
	},
	ignorePatterns: ['.eslintrc.js'],
	rules: {
		'import/no-unused-modules': 'off',
		'@typescript-eslint/explicit-member-accessibility': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/unified-signatures': 'off',
		'@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }]
	},
	settings: {
		include: ['./tests']
	}
};
