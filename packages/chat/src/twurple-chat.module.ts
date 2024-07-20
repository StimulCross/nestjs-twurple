import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { ChatClient } from '@twurple/chat';
import { TWURPLE_CHAT_CLIENT, TWURPLE_CHAT_OPTIONS } from './constants';
import {
	type TwurpleChatModuleAsyncOptions,
	type TwurpleChatModuleOptions
} from './interfaces/twurple-chat-module-options.interface';
import { type TwurpleChatOptionsFactory } from './interfaces/twurple-chat-options-factory.interface';
import { type TwurpleChatOptions } from './interfaces/twurple-chat-options.interface';

/**
 * Twurple chat client module.
 *
 * The module must be registered using either `register` or `registerAsync` static methods.
 */
@Module({})
export class TwurpleChatModule {
	/**
	 * Registers the module synchronously by direct options passing.
	 *
	 * @param options Twurple chat module options.
	 */
	public static register(options: TwurpleChatModuleOptions = {}): DynamicModule {
		const chatClientProvider = TwurpleChatModule._createChatClientProvider();

		return {
			global: options.isGlobal,
			module: TwurpleChatModule,
			providers: [TwurpleChatModule._createOptionsProvider(options), chatClientProvider],
			exports: [chatClientProvider]
		};
	}

	/**
	 * Registers the module asynchronously using one of the following factories: "useFactory", "useExisting", or
	 * "useClass".
	 *
	 * @param options Twurple chat module async options.
	 */
	public static registerAsync(options: TwurpleChatModuleAsyncOptions): DynamicModule {
		const chatClientProvider = TwurpleChatModule._createChatClientProvider();

		return {
			global: options.isGlobal,
			module: TwurpleChatModule,
			imports: options.imports,
			providers: [...TwurpleChatModule._createAsyncOptionsProviders(options), chatClientProvider],
			exports: [chatClientProvider]
		};
	}

	private static _createOptionsProvider(options: TwurpleChatOptions): Provider<TwurpleChatOptions> {
		return {
			provide: TWURPLE_CHAT_OPTIONS,
			useValue: options
		};
	}

	private static _createAsyncOptionsProviders(options: TwurpleChatModuleAsyncOptions): Provider[] {
		if (options.useExisting ?? options.useFactory) {
			return [TwurpleChatModule._createAsyncOptionsProvider(options)];
		}

		return [
			TwurpleChatModule._createAsyncOptionsProvider(options),
			{
				provide: options.useClass!,
				useClass: options.useClass!
			}
		];
	}

	private static _createAsyncOptionsProvider(options: TwurpleChatModuleAsyncOptions): Provider<TwurpleChatOptions> {
		if (options.useFactory) {
			return {
				provide: TWURPLE_CHAT_OPTIONS,
				inject: options.inject ?? [],
				useFactory: options.useFactory
			};
		}

		return {
			provide: TWURPLE_CHAT_OPTIONS,
			inject: [options.useExisting ?? options.useClass!],
			useFactory: async (factory: TwurpleChatOptionsFactory) => await factory.createTwurpleChatOptions()
		};
	}

	private static _createChatClientProvider(): Provider<ChatClient> {
		return {
			provide: TWURPLE_CHAT_CLIENT,
			inject: [TWURPLE_CHAT_OPTIONS],
			useFactory: (options: TwurpleChatOptions) => new ChatClient(options)
		};
	}
}
