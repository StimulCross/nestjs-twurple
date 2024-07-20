import { type DynamicModule, Inject, Module, type OnModuleInit, type Provider } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { EventSubMiddleware } from '@twurple/eventsub-http';
import { TWURPLE_EVENTSUB_HTTP_LISTENER, TWURPLE_EVENTSUB_HTTP_OPTIONS } from './constants';
import { InjectEventSubHttpListener } from './decorators/inject-eventsub-http-listener.decorator';
import {
	type TwurpleEventSubHttpModuleAsyncOptions,
	type TwurpleEventSubHttpModuleOptions
} from './interfaces/twurple-eventsub-http-module-options.interface';
import { type TwurpleEventSubHttpOptionsFactory } from './interfaces/twurple-eventsub-http-options-factory-interface';
import { type TwurpleEventSubHttpOptions } from './interfaces/twurple-eventsub-http-options.interface';

/**
 * Twurple EventSub HTTP listener module.
 *
 * The module must be registered using either `register` or `registerAsync` static methods.
 *
 * Only Express platform is supported.
 *
 * Note that Twurple handler expects raw non-consumed body to validate message signature. So you should set `bodyParser`
 * to `false` in application options.
 */
@Module({})
export class TwurpleEventSubHttpModule implements OnModuleInit {
	/** @private */
	constructor(
		private readonly _httpAdapterHost: HttpAdapterHost,
		@Inject(TWURPLE_EVENTSUB_HTTP_OPTIONS)
		private readonly _options: TwurpleEventSubHttpOptions,
		@InjectEventSubHttpListener() private readonly _eventSubHttpListener: EventSubMiddleware
	) {}

	/**
	 * Registers the module synchronously by direct options passing.
	 *
	 * @param options The Twurple EventSub HTTP module options.
	 */
	public static register(options: TwurpleEventSubHttpModuleOptions): DynamicModule {
		const eventSubHttpListenerProvider = TwurpleEventSubHttpModule._createEventSubHttpListenerProvider();

		return {
			global: options.isGlobal,
			module: TwurpleEventSubHttpModule,
			providers: [TwurpleEventSubHttpModule._createOptionsProvider(options), eventSubHttpListenerProvider],
			exports: [eventSubHttpListenerProvider]
		};
	}

	/**
	 * Registers the module asynchronously using one of the following factories: "useFactory", "useExisting", or
	 * "useClass".
	 *
	 * @param options The Twurple EventSub HTTP module async options.
	 */
	public static registerAsync(options: TwurpleEventSubHttpModuleAsyncOptions): DynamicModule {
		const eventSubHttpListenerProvider = TwurpleEventSubHttpModule._createEventSubHttpListenerProvider();

		return {
			global: options.isGlobal,
			module: TwurpleEventSubHttpModule,
			imports: options.imports,
			providers: [
				...TwurpleEventSubHttpModule._createAsyncOptionsProviders(options),
				eventSubHttpListenerProvider
			],
			exports: [eventSubHttpListenerProvider]
		};
	}

	/** @private */
	onModuleInit(): void {
		const adapterType = this._httpAdapterHost.httpAdapter.getType();

		if (adapterType !== 'express') {
			throw new Error(`Unsupported platform: ${adapterType}. Twurple EventSub supports only Express platform`);
		}

		if (this._options.applyHandlersOnModuleInit ?? true) {
			this._eventSubHttpListener.apply(this._httpAdapterHost.httpAdapter.getInstance());
		}
	}

	private static _createOptionsProvider(options: TwurpleEventSubHttpOptions): Provider<TwurpleEventSubHttpOptions> {
		return {
			provide: TWURPLE_EVENTSUB_HTTP_OPTIONS,
			useValue: options
		};
	}

	private static _createAsyncOptionsProviders(options: TwurpleEventSubHttpModuleAsyncOptions): Provider[] {
		if (options.useExisting ?? options.useFactory) {
			return [TwurpleEventSubHttpModule._createAsyncOptionsProvider(options)];
		}

		return [
			TwurpleEventSubHttpModule._createAsyncOptionsProvider(options),
			{
				provide: options.useClass!,
				useClass: options.useClass!
			}
		];
	}

	private static _createAsyncOptionsProvider(
		options: TwurpleEventSubHttpModuleAsyncOptions
	): Provider<TwurpleEventSubHttpOptions> {
		if (options.useFactory) {
			return {
				provide: TWURPLE_EVENTSUB_HTTP_OPTIONS,
				inject: options.inject ?? [],
				useFactory: options.useFactory
			};
		}

		return {
			provide: TWURPLE_EVENTSUB_HTTP_OPTIONS,
			inject: [options.useExisting ?? options.useClass!],
			useFactory: async (factory: TwurpleEventSubHttpOptionsFactory) =>
				await factory.createTwurpleEventSubHttpOptions()
		};
	}

	private static _createEventSubHttpListenerProvider(): Provider<EventSubMiddleware> {
		return {
			provide: TWURPLE_EVENTSUB_HTTP_LISTENER,
			inject: [TWURPLE_EVENTSUB_HTTP_OPTIONS],
			useFactory: (options: TwurpleEventSubHttpOptions) => new EventSubMiddleware(options)
		};
	}
}
