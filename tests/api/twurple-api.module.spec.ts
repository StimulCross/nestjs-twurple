import { type INestApplication, type ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApiClient } from '@twurple/api';
import { type AuthProvider, StaticAuthProvider } from '@twurple/auth';
import { ApiClientTestingService } from './mock/api-client-testing-service';
import { TwurpleApiClientOptionsFactory } from './mock/twurple-api-client-options-factory';
import { TwurpleApiClientOptionsFactoryModule } from './mock/twurple-api-client-options-factory.module';
import { TwurpleApiModule, type TwurpleApiOptions } from '../../packages/api/src';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '../../packages/auth/src';
import { MOCK_ACCESS_TOKEN, MOCK_CLIENT_ID } from '../constants';

const createTestApp = async (imports: ModuleMetadata['imports']): Promise<INestApplication> => {
	const TestingModule = await Test.createTestingModule({ imports, providers: [ApiClientTestingService] }).compile();
	return TestingModule.createNestApplication();
};

const testApiClient = (apiClient: ApiClient): void => {
	expect(apiClient).toBeDefined();
	expect(apiClient).toBeInstanceOf(ApiClient);
};

describe('Twurple API module test suite', () => {
	describe('Static "register" method', () => {
		test('should register the module', async () => {
			const app = await createTestApp([
				TwurpleApiModule.register({
					authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
				})
			]);

			const apiClientTestingService = app.get(ApiClientTestingService);
			await app.init();

			testApiClient(apiClientTestingService.apiClient);
		});
	});

	describe('Static "registerAsync" method', () => {
		test('should register the module with "useExisting" factory', async () => {
			const app = await createTestApp([
				TwurpleApiModule.registerAsync({
					imports: [TwurpleApiClientOptionsFactoryModule],
					useExisting: TwurpleApiClientOptionsFactory
				})
			]);

			const apiClientTestingService = app.get(ApiClientTestingService);
			await app.init();

			testApiClient(apiClientTestingService.apiClient);
		});

		test('should register the module with "useClass" factory', async () => {
			const app = await createTestApp([
				TwurpleApiModule.registerAsync({
					imports: [TwurpleApiClientOptionsFactoryModule],
					useClass: TwurpleApiClientOptionsFactory
				})
			]);

			const apiClientTestingService = app.get(ApiClientTestingService);
			await app.init();

			testApiClient(apiClientTestingService.apiClient);
		});

		test('should register the module with "useFactory" function', async () => {
			const app = await createTestApp([
				TwurpleApiModule.registerAsync({
					useFactory: () => {
						return { authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN) };
					}
				})
			]);

			const apiClientTestingService = app.get(ApiClientTestingService);
			await app.init();

			testApiClient(apiClientTestingService.apiClient);
		});

		test('"useFactory" function should inject specified dependencies', async () => {
			const useFactory = (factory: TwurpleApiClientOptionsFactory): TwurpleApiOptions => {
				expect(factory).toBeInstanceOf(TwurpleApiClientOptionsFactory);
				return { authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN) };
			};

			const app = await createTestApp([
				TwurpleApiModule.registerAsync({
					imports: [TwurpleApiClientOptionsFactoryModule],
					inject: [TwurpleApiClientOptionsFactory],
					useFactory
				})
			]);

			const apiClientTestingService = app.get(ApiClientTestingService);
			await app.init();

			testApiClient(apiClientTestingService.apiClient);
		});

		test('should register the module with TwurpleAuthModule', async () => {
			const app = await createTestApp([
				TwurpleApiModule.registerAsync({
					imports: [
						TwurpleAuthModule.register({
							type: 'static',
							clientId: MOCK_CLIENT_ID,
							accessToken: MOCK_ACCESS_TOKEN
						})
					],
					inject: [TWURPLE_AUTH_PROVIDER],
					useFactory: (authProvider: AuthProvider) => {
						return { authProvider };
					}
				})
			]);

			const apiClientTestingService = app.get(ApiClientTestingService);
			await app.init();

			testApiClient(apiClientTestingService.apiClient);
		});

		test('should register the module with global TwurpleAuthModule', async () => {
			const app = await createTestApp([
				TwurpleAuthModule.register({
					isGlobal: true,
					type: 'static',
					clientId: MOCK_CLIENT_ID,
					accessToken: MOCK_ACCESS_TOKEN
				}),
				TwurpleApiModule.registerAsync({
					inject: [TWURPLE_AUTH_PROVIDER],
					useFactory: (authProvider: AuthProvider) => {
						return { authProvider };
					}
				})
			]);

			const apiClientTestingService = app.get(ApiClientTestingService);
			await app.init();

			testApiClient(apiClientTestingService.apiClient);
		});
	});
});
