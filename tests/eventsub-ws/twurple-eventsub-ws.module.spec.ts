import { type INestApplication, type ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApiClient } from '@twurple/api';
import { type AuthProvider, RefreshingAuthProvider } from '@twurple/auth';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { EventSubWsTestingService } from './mock/eventsub-ws-testing-service';
import { TwurpleEventsubWsListenerOptionsFactory } from './mock/twurple-eventsub-ws-listener-options-factory';
import { TwurpleEventsubWsListenerOptionsFactoryModule } from './mock/twurple-eventsub-ws-listener-options-factory.module';
import { TWURPLE_API_CLIENT, TwurpleApiModule } from '../../packages/api/src';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '../../packages/auth/src';
import { TwurpleEventSubWsModule, type TwurpleEventSubWsOptions } from '../../packages/eventsub-ws/src';
import { MOCK_CLIENT_ID, MOCK_CLIENT_SECRET } from '../constants';

const createTestApp = async (imports: ModuleMetadata['imports']): Promise<INestApplication> => {
	const TestingModule = await Test.createTestingModule({ imports, providers: [EventSubWsTestingService] }).compile();
	return TestingModule.createNestApplication();
};

const createEventSubWsOptions = (apiClient?: ApiClient): TwurpleEventSubWsOptions => {
	return {
		apiClient:
			apiClient ??
			new ApiClient({
				authProvider: new RefreshingAuthProvider({
					clientId: MOCK_CLIENT_ID,
					clientSecret: MOCK_CLIENT_SECRET
				})
			})
	};
};

const testEventSubWsListener = (eventSubWsListener: EventSubWsListener): void => {
	expect(eventSubWsListener).toBeDefined();
	expect(eventSubWsListener).toBeInstanceOf(EventSubWsListener);
};

describe('Twurple EventSub WebSocket module test suite', () => {
	describe('Static "register" method', () => {
		test('should register the module', async () => {
			const app = await createTestApp([TwurpleEventSubWsModule.register(createEventSubWsOptions())]);
			await app.init();

			const eventSubWsTestingService = app.get(EventSubWsTestingService);
			testEventSubWsListener(eventSubWsTestingService.eventSubWsListener);
		});
	});

	describe('Static "registerAsync" method', () => {
		test('should register the module with "useExisting" factory', async () => {
			const app = await createTestApp([
				TwurpleEventSubWsModule.registerAsync({
					imports: [TwurpleEventsubWsListenerOptionsFactoryModule],
					useExisting: TwurpleEventsubWsListenerOptionsFactory
				})
			]);

			await app.init();

			const eventSubWsTestingService = app.get(EventSubWsTestingService);
			testEventSubWsListener(eventSubWsTestingService.eventSubWsListener);
		});

		test('should register the module with "useClass" factory', async () => {
			const app = await createTestApp([
				TwurpleEventSubWsModule.registerAsync({
					imports: [TwurpleEventsubWsListenerOptionsFactoryModule],
					useClass: TwurpleEventsubWsListenerOptionsFactory
				})
			]);

			await app.init();

			const eventSubWsTestingService = app.get(EventSubWsTestingService);
			testEventSubWsListener(eventSubWsTestingService.eventSubWsListener);
		});

		test('should register the module with "useFactory" function', async () => {
			const app = await createTestApp([
				TwurpleEventSubWsModule.registerAsync({
					isGlobal: true,
					useFactory: createEventSubWsOptions
				})
			]);

			await app.init();

			const eventSubWsTestingService = app.get(EventSubWsTestingService);
			testEventSubWsListener(eventSubWsTestingService.eventSubWsListener);
		});

		test('"useFactory" function should inject specified dependencies', async () => {
			const useFactory = (factory: TwurpleEventsubWsListenerOptionsFactory): TwurpleEventSubWsOptions => {
				expect(factory).toBeInstanceOf(TwurpleEventsubWsListenerOptionsFactory);
				return createEventSubWsOptions();
			};

			const app = await createTestApp([
				TwurpleEventSubWsModule.registerAsync({
					imports: [TwurpleEventsubWsListenerOptionsFactoryModule],
					inject: [TwurpleEventsubWsListenerOptionsFactory],
					useFactory
				})
			]);

			await app.init();

			const eventSubWsTestingService = app.get(EventSubWsTestingService);
			testEventSubWsListener(eventSubWsTestingService.eventSubWsListener);
		});

		test('should register the module with TwurpleApiModule', async () => {
			const app = await createTestApp([
				TwurpleEventSubWsModule.registerAsync({
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
					useFactory: createEventSubWsOptions
				})
			]);

			await app.init();

			const eventSubWsTestingService = app.get(EventSubWsTestingService);
			testEventSubWsListener(eventSubWsTestingService.eventSubWsListener);
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
				TwurpleEventSubWsModule.registerAsync({
					inject: [TWURPLE_AUTH_PROVIDER],
					useFactory: createEventSubWsOptions
				})
			]);

			await app.init();

			const eventSubWsTestingService = app.get(EventSubWsTestingService);
			testEventSubWsListener(eventSubWsTestingService.eventSubWsListener);
		});
	});
});
