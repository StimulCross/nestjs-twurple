import { type ModuleMetadata, type Type } from '@nestjs/common';
import { type TwurpleEventSubHttpOptionsFactory } from './twurple-eventsub-http-options-factory-interface';
import { type TwurpleEventSubHttpOptions } from './twurple-eventsub-http-options.interface';

/**
 * Twurple EventSub HTTP module extra options.
 */
export interface TwurpleEventSubHttpModuleExtraOptions {
	/**
	 * Whether the module should be global.
	 *
	 * Defaults to `false`.
	 */
	isGlobal?: boolean;
}

/**
 * Twurple EventSub HTTP module options.
 */
export interface TwurpleEventSubHttpModuleOptions
	extends TwurpleEventSubHttpModuleExtraOptions,
		TwurpleEventSubHttpOptions {}

/**
 * Twurple EventSub HTTP module async options.
 */
export interface TwurpleEventSubHttpModuleAsyncOptions
	extends TwurpleEventSubHttpModuleExtraOptions,
		Pick<ModuleMetadata, 'imports'> {
	/**
	 * Dependencies that a factory may inject.
	 */
	inject?: any[];

	/**
	 * Injection token resolving to a class that will be instantiated as a provider.
	 *
	 * The class must implement the corresponding interface.
	 */
	useClass?: Type<TwurpleEventSubHttpOptionsFactory>;

	/**
	 * Injection token resolving to an existing provider.
	 *
	 * The provider must implement the corresponding interface.
	 */
	useExisting?: Type<TwurpleEventSubHttpOptionsFactory>;

	/**
	 * Function returning options (or a Promise resolving to options) to configure the EventSub listener.
	 */
	useFactory?: (...args: any[]) => TwurpleEventSubHttpOptions | Promise<TwurpleEventSubHttpOptions>;
}
