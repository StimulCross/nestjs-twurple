import { type ModuleMetadata, type Type } from '@nestjs/common';
import { type TwurpleAuthOptionsFactory } from './twurple-auth-options-factory.interface';
import { type TwurpleAuthOptions } from './twurple-auth-options.interfaces';

/**
 * Twurple auth module extra options.
 */
export interface TwurpleAuthModuleExtraOptions {
	/**
	 * Whether the module should be registered as global.
	 */
	isGlobal?: boolean;
}

/**
 * Twurple auth module options.
 */
export type TwurpleAuthModuleOptions = TwurpleAuthOptions & TwurpleAuthModuleExtraOptions;

/**
 * Twurple auth module async options.
 */
export interface TwurpleAuthModuleAsyncOptions extends TwurpleAuthModuleExtraOptions, Pick<ModuleMetadata, 'imports'> {
	/**
	 * Dependencies that a factory may inject.
	 */
	inject?: any[];

	/**
	 * Injection token resolving to a class that will be instantiated as a provider.
	 *
	 * The class must implement {@link TwurpleAuthOptionsFactory} interface.
	 */
	useClass?: Type<TwurpleAuthOptionsFactory>;

	/**
	 * Injection token resolving to an existing provider.
	 *
	 * The provider must implement {@link TwurpleAuthOptionsFactory} interface.
	 */
	useExisting?: Type<TwurpleAuthOptionsFactory>;

	/**
	 * Function returning options (or a Promise resolving to options) to configure the auth provider.
	 */
	useFactory?: (...args: any[]) => TwurpleAuthOptions | Promise<TwurpleAuthOptions>;
}
