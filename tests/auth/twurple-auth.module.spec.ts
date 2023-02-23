/* eslint-disable max-nested-callbacks */
// eslint-disable-next-line max-classes-per-file
import { type DynamicModule } from '@nestjs/common';
import { type NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AppTokenAuthProvider, RefreshingAuthProvider, StaticAuthProvider } from '@twurple/auth';
import { AppTokenAuthProviderTestingService } from './mock/app-token-auth-provider-testing-service';
import { RefreshingAuthProviderTestingService } from './mock/refreshing-auth-provider-testing-service';
import { StaticAuthProviderTestingService } from './mock/static-auth-provider-testing-service';
import { TwurpleAuthAppTokenProviderOptionsFactory } from './mock/twurple-auth-app-token-provider-options.factory';
import { TwurpleAuthOptionsFactoryModule } from './mock/twurple-auth-options-factory.module';
import { TwurpleAuthRefreshingProviderOptionsFactory } from './mock/twurple-auth-refreshing-provider-options.factory';
import { TwurpleAuthStaticProviderOptionsFactory } from './mock/twurple-auth-static-provider-options.factory';
import { TwurpleAuthModule, type TwurpleAuthOptions } from '../../packages/auth/src';
import { MOCK_CLIENT_ID, MOCK_CLIENT_SECRET, MOCK_ACCESS_TOKEN } from '../constants';

const testStaticAuthProvider = (twurpleAuthModule: DynamicModule | Promise<DynamicModule>): void => {
	describe('Static auth provider', () => {
		let app: NestApplication;
		let staticAuthProviderTestingService: StaticAuthProviderTestingService;

		beforeAll(async () => {
			const TestingModule = await Test.createTestingModule({
				imports: [twurpleAuthModule],
				providers: [StaticAuthProviderTestingService]
			}).compile();

			app = TestingModule.createNestApplication();
			staticAuthProviderTestingService = app.get(StaticAuthProviderTestingService);

			await app.init();
		});

		test('should be defined', () => {
			expect(staticAuthProviderTestingService.authProvider).toBeDefined();
		});

		test('should be static', () => {
			expect(staticAuthProviderTestingService.authProvider).toBeInstanceOf(StaticAuthProvider);
		});

		test('should has valid credentials', () => {
			expect(staticAuthProviderTestingService.authProvider.clientId).toBe(MOCK_CLIENT_ID);
		});
	});
};

const testRefreshingAuthProvider = (twurpleAuthModule: DynamicModule | Promise<DynamicModule>): void => {
	describe('Refreshing auth provider', () => {
		let app: NestApplication;
		let refreshingAuthProviderTestingService: RefreshingAuthProviderTestingService;

		beforeAll(async () => {
			const TestingModule = await Test.createTestingModule({
				imports: [twurpleAuthModule],
				providers: [RefreshingAuthProviderTestingService]
			}).compile();

			app = TestingModule.createNestApplication();
			refreshingAuthProviderTestingService = app.get(RefreshingAuthProviderTestingService);

			await app.init();
		});

		test('should be defined', () => {
			expect(refreshingAuthProviderTestingService.authProvider).toBeDefined();
		});

		test('should be self-refreshing', () => {
			expect(refreshingAuthProviderTestingService.authProvider).toBeInstanceOf(RefreshingAuthProvider);
		});

		test('should has valid credentials', () => {
			expect(refreshingAuthProviderTestingService.authProvider.clientId).toBe(MOCK_CLIENT_ID);
		});
	});
};

const testAppTokenAuthProvider = (twurpleAuthModule: DynamicModule | Promise<DynamicModule>): void => {
	describe('App token auth provider', () => {
		let app: NestApplication;
		let appTokenAuthProviderTestingService: AppTokenAuthProviderTestingService;

		beforeAll(async () => {
			const TestingModule = await Test.createTestingModule({
				imports: [twurpleAuthModule],
				providers: [AppTokenAuthProviderTestingService]
			}).compile();

			app = TestingModule.createNestApplication();
			appTokenAuthProviderTestingService = app.get(AppTokenAuthProviderTestingService);

			await app.init();
		});

		afterAll(async () => {
			await app.close();
		});

		test('should be defined', () => {
			expect(appTokenAuthProviderTestingService.authProvider).toBeDefined();
		});

		test('should be app token based', () => {
			expect(appTokenAuthProviderTestingService.authProvider).toBeInstanceOf(AppTokenAuthProvider);
		});

		test('should has valid credentials', () => {
			expect(appTokenAuthProviderTestingService.authProvider.clientId).toBe(MOCK_CLIENT_ID);
		});
	});
};

describe('Twurple auth module test suite', () => {
	describe('Validation', () => {
		test('should throw error if invalid provider type passed', async () => {
			const t = async (): Promise<void> => {
				const TestingModule = await Test.createTestingModule({
					imports: [
						TwurpleAuthModule.register({
							// @ts-expect-error Invalid type
							type: 'invalid-type',
							clientId: MOCK_CLIENT_ID,
							accessToken: MOCK_ACCESS_TOKEN
						})
					]
				}).compile();

				const app = TestingModule.createNestApplication();
				await app.init();
			};

			await expect(t).rejects.toThrow();
		});
	});

	describe('Twurple auth register method', () => {
		const appTokenAuthModule = TwurpleAuthModule.register({
			type: 'app',
			clientId: MOCK_CLIENT_ID,
			clientSecret: MOCK_CLIENT_SECRET
		});

		testAppTokenAuthProvider(appTokenAuthModule);

		const staticAuthModule = TwurpleAuthModule.register({
			type: 'static',
			clientId: MOCK_CLIENT_ID,
			accessToken: MOCK_ACCESS_TOKEN
		});

		testStaticAuthProvider(staticAuthModule);

		const refreshingAuthModule = TwurpleAuthModule.register({
			type: 'refreshing',
			clientId: MOCK_CLIENT_ID,
			clientSecret: MOCK_CLIENT_SECRET
		});

		testRefreshingAuthProvider(refreshingAuthModule);
	});

	describe('Twurple auth registerAsync method', () => {
		describe('Auth provider should be resolved with "useClass" option', () => {
			const appTokenAuthModule = TwurpleAuthModule.registerAsync({
				imports: [TwurpleAuthOptionsFactoryModule],
				useClass: TwurpleAuthAppTokenProviderOptionsFactory
			});

			testAppTokenAuthProvider(appTokenAuthModule);

			const staticAuthModule = TwurpleAuthModule.registerAsync({
				imports: [TwurpleAuthOptionsFactoryModule],
				useClass: TwurpleAuthStaticProviderOptionsFactory
			});

			testStaticAuthProvider(staticAuthModule);

			const refreshingAuthModule = TwurpleAuthModule.registerAsync({
				imports: [TwurpleAuthOptionsFactoryModule],
				useClass: TwurpleAuthRefreshingProviderOptionsFactory
			});

			testRefreshingAuthProvider(refreshingAuthModule);
		});

		describe('Auth provider should be resolved with "useExisting" option', () => {
			const appTokenAuthModule = TwurpleAuthModule.registerAsync({
				imports: [TwurpleAuthOptionsFactoryModule],
				useExisting: TwurpleAuthAppTokenProviderOptionsFactory
			});

			testAppTokenAuthProvider(appTokenAuthModule);

			const staticAuthModule = TwurpleAuthModule.registerAsync({
				imports: [TwurpleAuthOptionsFactoryModule],
				useExisting: TwurpleAuthStaticProviderOptionsFactory
			});

			testStaticAuthProvider(staticAuthModule);

			const refreshingAuthModule = TwurpleAuthModule.registerAsync({
				imports: [TwurpleAuthOptionsFactoryModule],
				useExisting: TwurpleAuthRefreshingProviderOptionsFactory
			});

			testRefreshingAuthProvider(refreshingAuthModule);
		});

		describe('Auth provider should be resolved with "useFactory" option', () => {
			const appTokenAuthModule = TwurpleAuthModule.registerAsync({
				useFactory: async () => {
					return {
						type: 'app',
						clientId: MOCK_CLIENT_ID,
						clientSecret: MOCK_CLIENT_SECRET
					};
				}
			});

			testAppTokenAuthProvider(appTokenAuthModule);

			const staticAuthModule = TwurpleAuthModule.registerAsync({
				useFactory: async () => {
					return {
						type: 'static',
						clientId: MOCK_CLIENT_ID,
						accessToken: MOCK_ACCESS_TOKEN
					};
				}
			});

			testStaticAuthProvider(staticAuthModule);

			const refreshingAuthModule = TwurpleAuthModule.registerAsync({
				useFactory: async () => {
					return {
						type: 'refreshing',
						clientId: MOCK_CLIENT_ID,
						clientSecret: MOCK_CLIENT_SECRET
					};
				}
			});

			testRefreshingAuthProvider(refreshingAuthModule);

			test('imports should be injected to "useFactory" function', async () => {
				const useFactory = async (
					factory: TwurpleAuthStaticProviderOptionsFactory
				): Promise<TwurpleAuthOptions> => {
					expect(factory).toBeInstanceOf(TwurpleAuthStaticProviderOptionsFactory);

					return {
						type: 'static',
						clientId: MOCK_CLIENT_ID,
						accessToken: MOCK_ACCESS_TOKEN
					};
				};

				const TestingModule = await Test.createTestingModule({
					imports: [
						TwurpleAuthModule.registerAsync({
							imports: [TwurpleAuthOptionsFactoryModule],
							inject: [TwurpleAuthStaticProviderOptionsFactory],
							useFactory
						})
					]
				}).compile();

				const app = TestingModule.createNestApplication();
				await app.init();
			});
		});
	});
});
