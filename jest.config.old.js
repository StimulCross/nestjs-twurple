const transformPattern = '^.+\\.ts?$';
const baseProject = {
	transform: {
		[transformPattern]: 'ts-jest'
	},
	testEnvironment: 'node'
};

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	globals: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'ts-jest': {
			tsConfig: 'tsconfig.base.json'
		}
	},
	moduleFileExtensions: ['ts', 'js', 'node', 'json'],
	moduleNameMapper: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'@nestjs-twurple/auth/(.+)': '<rootDir>/packages/auth/src/$1'
	},
	rootDir: './',
	testEnvironment: 'node',
	testRegex: '.spec.ts$',
	transform: { [transformPattern]: ['ts-jest', { diagnostics: true }] },
	testPathIgnorePatterns: ['**/node_modules'],
	coverageDirectory: '<rootDir>/coverage',
	collectCoverageFrom: [
		'<rootDir>/packages/*/src/**/*.ts',
		'!<rootDir>/packages/**/src/index.ts',
		'!<rootDir>/packages/**/src/*.constants.ts'
	],
	moduleDirectories: ['node_modules'],

	projects: [
		{
			...baseProject,
			displayName: 'auth',
			testMatch: ['<rootDir>/packages/auth/tests/*.spec.ts']
		},
		{
			...baseProject,
			displayName: 'api',
			testMatch: ['<rootDir>/packages/api/tests/*.spec.ts']
		}
	]
};
