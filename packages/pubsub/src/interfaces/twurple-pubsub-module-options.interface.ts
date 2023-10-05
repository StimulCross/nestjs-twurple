import { type ModuleMetadata, type Type } from '@nestjs/common';
import { type TwurplePubSubOptionsFactory } from './twurple-pubsub-options-factory.interface';
import { type TwurplePubSubOptions } from './twurple-pubsub-options.interface';

/**
 * Twurple PubSub module extra options.
 */
export interface TwurplePubSubModuleExtraOptions {
	/**
	 * Whether the module should be global.
	 */
	isGlobal?: boolean;
}

/**
 * Twurple PubSub module options.
 */
export type TwurplePubSubModuleOptions = TwurplePubSubModuleExtraOptions & TwurplePubSubOptions;

/**
 * Twurple PubSub module async options.
 */
export interface TwurplePubSubModuleAsyncOptions
	extends TwurplePubSubModuleExtraOptions,
		Pick<ModuleMetadata, 'imports'> {
	/**
	 * Dependencies that a factory may inject.
	 */
	inject?: any[];

	/**
	 * Injection token resolving to a class that will be instantiated as a provider.
	 *
	 * The class must implement {@link TwurplePubSubOptionsFactory} interface.
	 */
	useClass?: Type<TwurplePubSubOptionsFactory>;

	/**
	 * Injection token resolving to an existing provider.
	 *
	 * The provider must implement {@link TwurplePubSubOptionsFactory} interface.
	 */
	useExisting?: Type<TwurplePubSubOptionsFactory>;

	/**
	 * Function returning options (or a Promise resolving to options) to configure the auth provider.
	 */
	useFactory?: (...args: any[]) => TwurplePubSubOptions | Promise<TwurplePubSubOptions>;
}
