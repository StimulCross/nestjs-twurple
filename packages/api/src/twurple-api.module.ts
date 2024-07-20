import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { ApiClient } from '@twurple/api';
import { TWURPLE_API_CLIENT, TWURPLE_API_OPTIONS } from './constants';
import {
	type TwurpleApiModuleAsyncOptions,
	type TwurpleApiModuleOptions
} from './interfaces/twurple-api-module-options.interface';
import { type TwurpleApiOptionsFactory } from './interfaces/twurple-api-options-factory.interface';
import { type TwurpleApiOptions } from './interfaces/twurple-api-options.interface';

/**
 * Twurple API client module.
 *
 * The module must be registered using either `register` or `registerAsync` static methods.
 */
@Module({})
export class TwurpleApiModule {
	/**
	 * Registers the module synchronously by direct options passing.
	 *
	 * @param options Twurple API module options.
	 */
	public static register(options: TwurpleApiModuleOptions): DynamicModule {
		const apiClient = TwurpleApiModule._createApiClientProvider();

		return {
			global: options.isGlobal,
			module: TwurpleApiModule,
			providers: [TwurpleApiModule._createOptionsProvider(options), apiClient],
			exports: [apiClient]
		};
	}

	/**
	 * Registers the module asynchronously using one of the following factories: "useFactory", "useExisting", or
	 * "useClass".
	 *
	 * @param options Twurple API module async options.
	 */
	public static registerAsync(options: TwurpleApiModuleAsyncOptions): DynamicModule {
		const apiClient = TwurpleApiModule._createApiClientProvider();

		return {
			global: options.isGlobal,
			module: TwurpleApiModule,
			imports: options.imports,
			providers: [...TwurpleApiModule._createAsyncOptionsProviders(options), apiClient],
			exports: [apiClient]
		};
	}

	private static _createOptionsProvider(options: TwurpleApiOptions): Provider<TwurpleApiOptions> {
		return {
			provide: TWURPLE_API_OPTIONS,
			useValue: options
		};
	}

	private static _createAsyncOptionsProviders(options: TwurpleApiModuleAsyncOptions): Provider[] {
		if (options.useExisting ?? options.useFactory) {
			return [TwurpleApiModule._createAsyncOptionsProvider(options)];
		}

		return [
			TwurpleApiModule._createAsyncOptionsProvider(options),
			{
				provide: options.useClass!,
				useClass: options.useClass!
			}
		];
	}

	private static _createAsyncOptionsProvider(options: TwurpleApiModuleAsyncOptions): Provider<TwurpleApiOptions> {
		if (options.useFactory) {
			return {
				provide: TWURPLE_API_OPTIONS,
				inject: options.inject ?? [],
				useFactory: options.useFactory
			};
		}

		return {
			provide: TWURPLE_API_OPTIONS,
			inject: [options.useExisting ?? options.useClass!],
			useFactory: async (factory: TwurpleApiOptionsFactory) => await factory.createTwurpleApiOptions()
		};
	}

	private static _createApiClientProvider(): Provider<ApiClient> {
		return {
			provide: TWURPLE_API_CLIENT,
			inject: [TWURPLE_API_OPTIONS],
			useFactory: (options: TwurpleApiOptions) => new ApiClient(options)
		};
	}
}
