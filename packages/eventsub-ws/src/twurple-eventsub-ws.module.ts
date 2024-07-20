import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { TWURPLE_EVENTSUB_WS_LISTENER, TWURPLE_EVENTSUB_WS_OPTIONS } from './constants';
import {
	type TwurpleEventSubWsModuleAsyncOptions,
	type TwurpleEventSubWsModuleOptions
} from './interfaces/twurple-eventsub-ws-module-options.interface';
import { type TwurpleEventSubWsOptionsFactory } from './interfaces/twurple-eventsub-ws-options-factory-interface';
import { type TwurpleEventSubWsOptions } from './interfaces/twurple-eventsub-ws-options.interface';

/**
 * Twurple EventSub WebSocket listener module.
 *
 * The module must be registered using either `register` or `registerAsync` static methods.
 *
 * @beta
 */
@Module({})
export class TwurpleEventSubWsModule {
	/**
	 * Registers the module synchronously by direct options passing.
	 *
	 * @param options Twurple EventSub WebSocket module options.
	 */
	public static register(options: TwurpleEventSubWsModuleOptions): DynamicModule {
		const eventSubWsListenerProvider = TwurpleEventSubWsModule._createEventSubWsListenerProvider();

		return {
			global: options.isGlobal,
			module: TwurpleEventSubWsModule,
			providers: [TwurpleEventSubWsModule._createOptionsProvider(options), eventSubWsListenerProvider],
			exports: [eventSubWsListenerProvider]
		};
	}

	/**
	 * Registers the module asynchronously using one of the following factories: "useFactory", "useExisting", or
	 * "useClass".
	 *
	 * @param options Twurple EventSub WebSocket module async options.
	 */
	public static registerAsync(options: TwurpleEventSubWsModuleAsyncOptions): DynamicModule {
		const eventSubWsListenerProvider = TwurpleEventSubWsModule._createEventSubWsListenerProvider();

		return {
			global: options.isGlobal,
			module: TwurpleEventSubWsModule,
			imports: options.imports,
			providers: [...TwurpleEventSubWsModule._createAsyncOptionsProviders(options), eventSubWsListenerProvider],
			exports: [eventSubWsListenerProvider]
		};
	}

	private static _createOptionsProvider(options: TwurpleEventSubWsOptions): Provider<TwurpleEventSubWsOptions> {
		return {
			provide: TWURPLE_EVENTSUB_WS_OPTIONS,
			useValue: options
		};
	}

	private static _createAsyncOptionsProviders(options: TwurpleEventSubWsModuleAsyncOptions): Provider[] {
		if (options.useExisting ?? options.useFactory) {
			return [TwurpleEventSubWsModule._createAsyncOptionsProvider(options)];
		}

		return [
			TwurpleEventSubWsModule._createAsyncOptionsProvider(options),
			{
				provide: options.useClass!,
				useClass: options.useClass!
			}
		];
	}

	private static _createAsyncOptionsProvider(
		options: TwurpleEventSubWsModuleAsyncOptions
	): Provider<TwurpleEventSubWsOptions> {
		if (options.useFactory) {
			return {
				provide: TWURPLE_EVENTSUB_WS_OPTIONS,
				inject: options.inject ?? [],
				useFactory: options.useFactory
			};
		}

		return {
			provide: TWURPLE_EVENTSUB_WS_OPTIONS,
			inject: [options.useExisting ?? options.useClass!],
			useFactory: async (factory: TwurpleEventSubWsOptionsFactory) =>
				await factory.createTwurpleEventSubWsOptions()
		};
	}

	private static _createEventSubWsListenerProvider(): Provider<EventSubWsListener> {
		return {
			provide: TWURPLE_EVENTSUB_WS_LISTENER,
			inject: [TWURPLE_EVENTSUB_WS_OPTIONS],
			useFactory: (options: TwurpleEventSubWsOptions) => new EventSubWsListener(options)
		};
	}
}
