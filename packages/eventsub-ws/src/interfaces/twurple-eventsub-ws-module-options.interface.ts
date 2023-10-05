import { type ModuleMetadata, type Type } from '@nestjs/common';
import { type TwurpleEventSubWsOptionsFactory } from './twurple-eventsub-ws-options-factory-interface';
import { type TwurpleEventSubWsOptions } from './twurple-eventsub-ws-options.interface';

/**
 * Twurple EventSub WebSocket module extra options.
 */
export interface TwurpleEventSubWsModuleExtraOptions {
	/**
	 * Whether the module should be global.
	 *
	 * Defaults to `false`.
	 */
	isGlobal?: boolean;
}

/**
 * Twurple EventSub WebSocket module options.
 */
export type TwurpleEventSubWsModuleOptions = TwurpleEventSubWsModuleExtraOptions & TwurpleEventSubWsOptions;

/**
 * Twurple EventSub WebSocket module async options.
 */
export interface TwurpleEventSubWsModuleAsyncOptions
	extends TwurpleEventSubWsModuleExtraOptions,
		Pick<ModuleMetadata, 'imports'> {
	/**
	 * Dependencies that a factory may inject.
	 */
	inject?: any[];

	/**
	 * Injection token resolving to a class that will be instantiated as a provider.
	 *
	 * The class must implement {@link TwurpleEventSubWsOptionsFactory} interface.
	 */
	useClass?: Type<TwurpleEventSubWsOptionsFactory>;

	/**
	 * Injection token resolving to an existing provider.
	 *
	 * The provider must implement {@link TwurpleEventSubWsOptionsFactory} interface.
	 */
	useExisting?: Type<TwurpleEventSubWsOptionsFactory>;

	/**
	 * Function returning options (or a Promise resolving to options) to configure the EventSub listener.
	 */
	useFactory?: (...args: any[]) => TwurpleEventSubWsOptions | Promise<TwurpleEventSubWsOptions>;
}
