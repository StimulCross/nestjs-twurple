import { type INestApplication, type ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { type AuthProvider, StaticAuthProvider } from '@twurple/auth';
import { PubSubClient } from '@twurple/pubsub';
import { PubSubClientTestingService } from './mock/pubsub-client-testing-service';
import { TwurplePubSubClientOptionsFactory } from './mock/twurple-pubsub-client-options-factory';
import { TwurplePubSubClientOptionsFactoryModule } from './mock/twurple-pubsub-client-options-factory.module';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '../../packages/auth/src';
import { TwurplePubSubModule, type TwurplePubSubOptions } from '../../packages/pubsub/src';
import { MOCK_ACCESS_TOKEN, MOCK_CLIENT_ID } from '../constants';

const createTestApp = async (imports: ModuleMetadata['imports']): Promise<INestApplication> => {
	const TestingModule = await Test.createTestingModule({
		imports,
		providers: [PubSubClientTestingService]
	}).compile();
	return TestingModule.createNestApplication();
};

const testPubSubClient = (pubSubClient: PubSubClient): void => {
	expect(pubSubClient).toBeDefined();
	expect(pubSubClient).toBeInstanceOf(PubSubClient);
};

describe('Twurple PubSub module test suite', () => {
	describe('Static "register" method', () => {
		test('should register the module', async () => {
			const app = await createTestApp([
				TwurplePubSubModule.register({
					authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
				})
			]);

			const pubSubClientTestingService = app.get(PubSubClientTestingService);
			await app.init();

			testPubSubClient(pubSubClientTestingService.pubSubClient);
		});
	});

	describe('Static "registerAsync" method', () => {
		test('should register the module with "useExisting" factory', async () => {
			const app = await createTestApp([
				TwurplePubSubModule.registerAsync({
					imports: [TwurplePubSubClientOptionsFactoryModule],
					useExisting: TwurplePubSubClientOptionsFactory
				})
			]);

			const pubSubClientTestingService = app.get(PubSubClientTestingService);
			await app.init();

			testPubSubClient(pubSubClientTestingService.pubSubClient);
		});

		test('should register the module with "useClass" factory', async () => {
			const app = await createTestApp([
				TwurplePubSubModule.registerAsync({
					imports: [TwurplePubSubClientOptionsFactoryModule],
					useClass: TwurplePubSubClientOptionsFactory
				})
			]);

			const pubSubClientTestingService = app.get(PubSubClientTestingService);
			await app.init();

			testPubSubClient(pubSubClientTestingService.pubSubClient);
		});

		test('should register the module with "useFactory" function', async () => {
			const app = await createTestApp([
				TwurplePubSubModule.registerAsync({
					useFactory: () => {
						return {
							authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
						};
					}
				})
			]);

			const pubSubClientTestingService = app.get(PubSubClientTestingService);
			await app.init();

			testPubSubClient(pubSubClientTestingService.pubSubClient);
		});

		test('"useFactory" function should inject specified dependencies', async () => {
			const useFactory = (factory: TwurplePubSubClientOptionsFactory): TwurplePubSubOptions => {
				expect(factory).toBeInstanceOf(TwurplePubSubClientOptionsFactory);
				return {
					authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
				};
			};

			const app = await createTestApp([
				TwurplePubSubModule.registerAsync({
					imports: [TwurplePubSubClientOptionsFactoryModule],
					inject: [TwurplePubSubClientOptionsFactory],
					useFactory
				})
			]);

			const pubSubClientTestingService = app.get(PubSubClientTestingService);
			await app.init();

			testPubSubClient(pubSubClientTestingService.pubSubClient);
		});

		test('should register the module with TwurpleAuthModule', async () => {
			const app = await createTestApp([
				TwurplePubSubModule.registerAsync({
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

			const pubSubClientTestingService = app.get(PubSubClientTestingService);
			await app.init();

			testPubSubClient(pubSubClientTestingService.pubSubClient);
		});

		test('should register the module with global TwurpleAuthModule', async () => {
			const app = await createTestApp([
				TwurpleAuthModule.register({
					isGlobal: true,
					type: 'static',
					clientId: MOCK_CLIENT_ID,
					accessToken: MOCK_ACCESS_TOKEN
				}),
				TwurplePubSubModule.registerAsync({
					inject: [TWURPLE_AUTH_PROVIDER],
					useFactory: (authProvider: AuthProvider) => {
						return { authProvider };
					}
				})
			]);

			const pubSubClientTestingService = app.get(PubSubClientTestingService);
			await app.init();

			testPubSubClient(pubSubClientTestingService.pubSubClient);
		});
	});
});
