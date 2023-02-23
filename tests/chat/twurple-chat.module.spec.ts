import { type INestApplication, type ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { type AuthProvider, StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { ChatClientTestingService } from './mock/chat-client-testing-service';
import { TwurpleChatClientOptionsFactory } from './mock/twurple-chat-client-options-factory';
import { TwurpleChatClientOptionsFactoryModule } from './mock/twurple-chat-client-options-factory.module';
import { type TwurpleApiOptions } from '../../packages/api/src';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '../../packages/auth/src';
import { TwurpleChatModule } from '../../packages/chat/src';
import { MOCK_ACCESS_TOKEN, MOCK_CLIENT_ID } from '../constants';

const createTestApp = async (imports: ModuleMetadata['imports']): Promise<INestApplication> => {
	const TestingModule = await Test.createTestingModule({ imports, providers: [ChatClientTestingService] }).compile();
	return TestingModule.createNestApplication();
};

const testChatClient = (chatClient: ChatClient): void => {
	expect(chatClient).toBeDefined();
	expect(chatClient).toBeInstanceOf(ChatClient);
};

describe('Twurple chat module test suite', () => {
	describe('Static "register" method', () => {
		test('should register the module without options', async () => {
			const app = await createTestApp([TwurpleChatModule.register()]);

			const chatClientTestingService = app.get(ChatClientTestingService);
			await app.init();

			testChatClient(chatClientTestingService.chatClient);
		});

		test('should register the module with options', async () => {
			const app = await createTestApp([
				TwurpleChatModule.register({
					authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
				})
			]);

			const chatClientTestingService = app.get(ChatClientTestingService);
			await app.init();

			testChatClient(chatClientTestingService.chatClient);
		});
	});

	describe('Static "registerAsync" method', () => {
		test('should register the module with "useExisting" factory', async () => {
			const app = await createTestApp([
				TwurpleChatModule.registerAsync({
					imports: [TwurpleChatClientOptionsFactoryModule],
					useExisting: TwurpleChatClientOptionsFactory
				})
			]);

			const chatClientTestingService = app.get(ChatClientTestingService);
			await app.init();

			testChatClient(chatClientTestingService.chatClient);
		});

		test('should register the module with "useClass" factory', async () => {
			const app = await createTestApp([
				TwurpleChatModule.registerAsync({
					imports: [TwurpleChatClientOptionsFactoryModule],
					useClass: TwurpleChatClientOptionsFactory
				})
			]);

			const chatClientTestingService = app.get(ChatClientTestingService);
			await app.init();

			testChatClient(chatClientTestingService.chatClient);
		});

		test('should register the module with "useFactory" function', async () => {
			const app = await createTestApp([
				TwurpleChatModule.registerAsync({
					useFactory: () => {
						return {
							authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
						};
					}
				})
			]);

			const chatClientTestingService = app.get(ChatClientTestingService);
			await app.init();

			testChatClient(chatClientTestingService.chatClient);
		});

		test('"useFactory" function should inject specified dependencies', async () => {
			const useFactory = (factory: TwurpleChatClientOptionsFactory): TwurpleApiOptions => {
				expect(factory).toBeInstanceOf(TwurpleChatClientOptionsFactory);
				return {
					authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
				};
			};

			const app = await createTestApp([
				TwurpleChatModule.registerAsync({
					imports: [TwurpleChatClientOptionsFactoryModule],
					inject: [TwurpleChatClientOptionsFactory],
					useFactory
				})
			]);

			const chatClientTestingService = app.get(ChatClientTestingService);
			await app.init();

			testChatClient(chatClientTestingService.chatClient);
		});

		test('should register the module with TwurpleAuthModule', async () => {
			const app = await createTestApp([
				TwurpleChatModule.registerAsync({
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

			const chatClientTestingService = app.get(ChatClientTestingService);
			await app.init();

			testChatClient(chatClientTestingService.chatClient);
		});

		test('should register the module with global TwurpleAuthModule', async () => {
			const app = await createTestApp([
				TwurpleAuthModule.register({
					isGlobal: true,
					type: 'static',
					clientId: MOCK_CLIENT_ID,
					accessToken: MOCK_ACCESS_TOKEN
				}),
				TwurpleChatModule.registerAsync({
					inject: [TWURPLE_AUTH_PROVIDER],
					useFactory: (authProvider: AuthProvider) => {
						return {
							authProvider,
							requestMembershipEvents: true,
							isAlwaysMod: true
						};
					}
				})
			]);

			const chatClientTestingService = app.get(ChatClientTestingService);
			await app.init();

			testChatClient(chatClientTestingService.chatClient);
		});
	});
});
