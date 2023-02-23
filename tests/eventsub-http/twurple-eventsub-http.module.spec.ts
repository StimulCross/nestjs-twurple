import { type INestApplication, type ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApiClient } from '@twurple/api';
import { type AuthProvider, RefreshingAuthProvider } from '@twurple/auth';
import { EventSubMiddleware } from '@twurple/eventsub-http';
import { EventsubHttpTestingService } from './mock/eventsub-http-testing-service';
import { TwurpleEventsubHttpListenerOptionsFactory } from './mock/twurple-eventsub-http-listener-options-factory';
import { TwurpleEventsubHttpListenerOptionsFactoryModule } from './mock/twurple-eventsub-http-listener-options-factory.module';
import { TWURPLE_API_CLIENT, TwurpleApiModule } from '../../packages/api/src';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '../../packages/auth/src';
import { TwurpleEventSubHttpModule, type TwurpleEventSubHttpOptions } from '../../packages/eventsub-http/src';
import { MOCK_CLIENT_ID, MOCK_CLIENT_SECRET, MOCK_HOST_NAME, SECRET } from '../constants';

const createTestApp = async (imports: ModuleMetadata['imports']): Promise<INestApplication> => {
	const TestingModule = await Test.createTestingModule({
		imports,
		providers: [EventsubHttpTestingService]
	}).compile();
	return TestingModule.createNestApplication();
};

const createEventSubOptions = (apiClient?: ApiClient): TwurpleEventSubHttpOptions => {
	return {
		apiClient:
			apiClient ??
			new ApiClient({
				authProvider: new RefreshingAuthProvider({
					clientId: MOCK_CLIENT_ID,
					clientSecret: MOCK_CLIENT_SECRET
				})
			}),
		hostName: MOCK_HOST_NAME,
		secret: SECRET,
		legacySecrets: false
	};
};

const testEventSubHttpListener = (eventSubHttpListener: EventSubMiddleware): void => {
	expect(eventSubHttpListener).toBeDefined();
	expect(eventSubHttpListener).toBeInstanceOf(EventSubMiddleware);
};

describe('Twurple EventSub HTTP module test suite', () => {
	describe('Static "register" method', () => {
		test('should register the module', async () => {
			const app = await createTestApp([TwurpleEventSubHttpModule.register(createEventSubOptions())]);

			const eventSubHttpTestingService = app.get(EventsubHttpTestingService);
			await app.init();

			testEventSubHttpListener(eventSubHttpTestingService.eventSubHttpListener);
		});
	});

	describe('Static "registerAsync" method', () => {
		test('should register the module with "useExisting" factory', async () => {
			const app = await createTestApp([
				TwurpleEventSubHttpModule.registerAsync({
					imports: [TwurpleEventsubHttpListenerOptionsFactoryModule],
					useExisting: TwurpleEventsubHttpListenerOptionsFactory
				})
			]);

			const eventSubHttpTestingService = app.get(EventsubHttpTestingService);
			await app.init();

			testEventSubHttpListener(eventSubHttpTestingService.eventSubHttpListener);
		});

		test('should register the module with "useClass" factory', async () => {
			const app = await createTestApp([
				TwurpleEventSubHttpModule.registerAsync({
					imports: [TwurpleEventsubHttpListenerOptionsFactoryModule],
					useClass: TwurpleEventsubHttpListenerOptionsFactory
				})
			]);

			const eventSubHttpTestingService = app.get(EventsubHttpTestingService);
			await app.init();

			testEventSubHttpListener(eventSubHttpTestingService.eventSubHttpListener);
		});

		test('should register the module with "useFactory" function', async () => {
			const app = await createTestApp([
				TwurpleEventSubHttpModule.registerAsync({
					isGlobal: true,
					useFactory: createEventSubOptions
				})
			]);

			const eventSubHttpTestingService = app.get(EventsubHttpTestingService);
			await app.init();

			testEventSubHttpListener(eventSubHttpTestingService.eventSubHttpListener);
		});

		test('"useFactory" function should inject specified dependencies', async () => {
			const useFactory = (factory: TwurpleEventsubHttpListenerOptionsFactory): TwurpleEventSubHttpOptions => {
				expect(factory).toBeInstanceOf(TwurpleEventsubHttpListenerOptionsFactory);
				return createEventSubOptions();
			};

			const app = await createTestApp([
				TwurpleEventSubHttpModule.registerAsync({
					imports: [TwurpleEventsubHttpListenerOptionsFactoryModule],
					inject: [TwurpleEventsubHttpListenerOptionsFactory],
					useFactory
				})
			]);

			const eventSubHttpTestingService = app.get(EventsubHttpTestingService);
			await app.init();

			testEventSubHttpListener(eventSubHttpTestingService.eventSubHttpListener);
		});

		test('should register the module with TwurpleApiModule', async () => {
			const app = await createTestApp([
				TwurpleEventSubHttpModule.registerAsync({
					imports: [
						TwurpleApiModule.registerAsync({
							imports: [
								TwurpleAuthModule.register({
									type: 'refreshing',
									clientId: MOCK_CLIENT_ID,
									clientSecret: MOCK_CLIENT_SECRET
								})
							],
							inject: [TWURPLE_AUTH_PROVIDER],
							useFactory: (authProvider: AuthProvider) => {
								return { authProvider };
							}
						})
					],
					inject: [TWURPLE_API_CLIENT],
					useFactory: createEventSubOptions
				})
			]);

			const eventSubHttpTestingService = app.get(EventsubHttpTestingService);
			await app.init();

			testEventSubHttpListener(eventSubHttpTestingService.eventSubHttpListener);
		});

		test('should register the module with global TwurpleApiModule', async () => {
			const app = await createTestApp([
				TwurpleAuthModule.register({
					isGlobal: true,
					type: 'refreshing',
					clientId: MOCK_CLIENT_ID,
					clientSecret: MOCK_CLIENT_SECRET
				}),
				TwurpleApiModule.registerAsync({
					isGlobal: true,
					inject: [TWURPLE_AUTH_PROVIDER],
					useFactory: (authProvider: AuthProvider) => {
						return { authProvider };
					}
				}),
				TwurpleEventSubHttpModule.registerAsync({
					inject: [TWURPLE_AUTH_PROVIDER],
					useFactory: createEventSubOptions
				})
			]);

			const eventSubHttpTestingService = app.get(EventsubHttpTestingService);
			await app.init();

			testEventSubHttpListener(eventSubHttpTestingService.eventSubHttpListener);
		});
	});
});
