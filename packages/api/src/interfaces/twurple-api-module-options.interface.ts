import { type ModuleMetadata, type Type } from '@nestjs/common';
import { type TwurpleApiOptionsFactory } from './twurple-api-options-factory.interface';
import { type TwurpleApiOptions } from './twurple-api-options.interface';

/**
 * Twurple API module extra options.
 */
export interface TwurpleApiModuleExtraOptions {
	/**
	 * Whether the module should be global.
	 */
	isGlobal?: boolean;
}

/**
 * Twurple API module options.
 */
export type TwurpleApiModuleOptions = TwurpleApiModuleExtraOptions & TwurpleApiOptions;

/**
 * Twurple API module async options.
 */
export interface TwurpleApiModuleAsyncOptions extends TwurpleApiModuleExtraOptions, Pick<ModuleMetadata, 'imports'> {
	/**
	 * Dependencies that a factory may inject.
	 */
	inject?: any[];

	/**
	 * Injection token resolving to a class that will be instantiated as a provider.
	 *
	 * The class must implement {@link TwurpleApiOptionsFactory} interface.
	 */
	useClass?: Type<TwurpleApiOptionsFactory>;

	/**
	 * Injection token resolving to an existing provider.
	 *
	 * The provider must implement {@link TwurpleApiOptionsFactory} interface.
	 */
	useExisting?: Type<TwurpleApiOptionsFactory>;

	/**
	 * Function returning options (or a Promise resolving to options) to configure the auth provider.
	 */
	useFactory?: (...args: any[]) => TwurpleApiOptions | Promise<TwurpleApiOptions>;
}
