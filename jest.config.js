const transformPattern = '^.+\\.ts?$';
const transform = {
	[transformPattern]: ['ts-jest', { diagnostics: true, tsconfig: './tsconfig.json' }]
};

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	moduleFileExtensions: ['ts', 'js', 'node', 'json'],
	rootDir: './',
	testEnvironment: 'node',
	transform,
	testMatch: ['<rootDir>/tests/**/*.spec.ts'],
	coverageDirectory: '<rootDir>/coverage',
	collectCoverageFrom: [
		'<rootDir>/packages/*/src/**/*.ts',
		'!<rootDir>/packages/**/src/index.ts',
		'!<rootDir>/packages/**/src/constants.ts'
	],
	moduleDirectories: ['node_modules'],
	projects: [
		{
			displayName: 'auth',
			testMatch: ['<rootDir>/tests/auth/*.spec.ts'],
			transform
		},
		{
			displayName: 'api',
			testMatch: ['<rootDir>/tests/api/*.spec.ts'],
			transform
		},
		{
			displayName: 'chat',
			testMatch: ['<rootDir>/tests/chat/*.spec.ts'],
			transform
		},
		{
			displayName: 'pubsub',
			testMatch: ['<rootDir>/tests/pubsub/*.spec.ts'],
			transform
		},
		{
			displayName: 'eventsub-http',
			testMatch: ['<rootDir>/tests/eventsub-http/*.spec.ts'],
			transform
		},
		{
			displayName: 'eventsub-ws',
			testMatch: ['<rootDir>/tests/eventsub-ws/*.spec.ts'],
			transform
		}
	]
};
