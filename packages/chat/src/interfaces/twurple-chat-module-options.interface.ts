import { type ModuleMetadata, type Type } from '@nestjs/common';
import { type TwurpleChatOptionsFactory } from './twurple-chat-options-factory.interface';
import { type TwurpleChatOptions } from './twurple-chat-options.interface';

/**
 * Twurple chat module extra options.
 */
export interface TwurpleChatModuleExtraOptions {
	/**
	 * Whether the module should be global.
	 */
	isGlobal?: boolean;
}

/**
 * Twurple chat module options.
 */
export type TwurpleChatModuleOptions = TwurpleChatModuleExtraOptions & TwurpleChatOptions;

/**
 * Twurple chat module async options.
 */
export interface TwurpleChatModuleAsyncOptions extends TwurpleChatModuleExtraOptions, Pick<ModuleMetadata, 'imports'> {
	/**
	 * Dependencies that a factory may inject.
	 */
	inject?: any[];

	/**
	 * Injection token resolving to a class that will be instantiated as a provider.
	 *
	 * The class must implement {@link TwurpleChatOptionsFactory} interface.
	 */
	useClass?: Type<TwurpleChatOptionsFactory>;

	/**
	 * Injection token resolving to an existing provider.
	 *
	 * The provider must implement {@link TwurpleChatOptionsFactory} interface.
	 */
	useExisting?: Type<TwurpleChatOptionsFactory>;

	/**
	 * Function returning options (or a Promise resolving to options) to configure the auth provider.
	 */
	useFactory?: (...args: any[]) => TwurpleChatOptions | Promise<TwurpleChatOptions>;
}
