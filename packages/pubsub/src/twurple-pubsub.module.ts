import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { PubSubClient } from '@twurple/pubsub';
import { TWURPLE_PUBSUB_CLIENT, TWURPLE_PUBSUB_OPTIONS } from './constants';
import {
	type TwurplePubSubModuleAsyncOptions,
	type TwurplePubSubModuleOptions
} from './interfaces/twurple-pubsub-module-options.interface';
import { type TwurplePubSubOptionsFactory } from './interfaces/twurple-pubsub-options-factory.interface';
import { type TwurplePubSubOptions } from './interfaces/twurple-pubsub-options.interface';

/**
 * Twurple PubSub module.
 *
 * The module must be registered using either `register` or `registerAsync` static methods.
 */
@Module({})
export class TwurplePubSubModule {
	/**
	 * Registers the module synchronously by direct options passing.
	 *
	 * @param options Twurple PubSub module options.
	 */
	public static register(options: TwurplePubSubModuleOptions): DynamicModule {
		const pubSubClientProvider = TwurplePubSubModule._createPubSubClientProvider();

		return {
			global: options.isGlobal,
			module: TwurplePubSubModule,
			providers: [TwurplePubSubModule._createOptionsProvider(options), pubSubClientProvider],
			exports: [pubSubClientProvider]
		};
	}

	/**
	 * Registers the module asynchronously using one of the following factories: "useFactory", "useExisting", or
	 * "useClass".
	 *
	 * @param options Twurple PubSub module async options.
	 */
	public static registerAsync(options: TwurplePubSubModuleAsyncOptions): DynamicModule {
		const pubSubClientProvider = TwurplePubSubModule._createPubSubClientProvider();

		return {
			global: options.isGlobal,
			module: TwurplePubSubModule,
			imports: options.imports,
			providers: [...TwurplePubSubModule._createAsyncOptionsProviders(options), pubSubClientProvider],
			exports: [pubSubClientProvider]
		};
	}

	private static _createOptionsProvider(options: TwurplePubSubOptions): Provider<TwurplePubSubOptions> {
		return {
			provide: TWURPLE_PUBSUB_OPTIONS,
			useValue: options
		};
	}

	private static _createAsyncOptionsProviders(options: TwurplePubSubModuleAsyncOptions): Provider[] {
		if (options.useExisting ?? options.useFactory) {
			return [TwurplePubSubModule._createAsyncOptionsProvider(options)];
		}

		return [
			TwurplePubSubModule._createAsyncOptionsProvider(options),
			{
				provide: options.useClass!,
				useClass: options.useClass!
			}
		];
	}

	private static _createAsyncOptionsProvider(
		options: TwurplePubSubModuleAsyncOptions
	): Provider<TwurplePubSubOptions> {
		if (options.useFactory) {
			return {
				provide: TWURPLE_PUBSUB_OPTIONS,
				inject: options.inject ?? [],
				useFactory: options.useFactory
			};
		}

		return {
			provide: TWURPLE_PUBSUB_OPTIONS,
			inject: [options.useExisting ?? options.useClass!],
			useFactory: async (factory: TwurplePubSubOptionsFactory) => await factory.createTwurplePubSubOptions()
		};
	}

	private static _createPubSubClientProvider(): Provider<PubSubClient> {
		return {
			provide: TWURPLE_PUBSUB_CLIENT,
			inject: [TWURPLE_PUBSUB_OPTIONS],
			useFactory: (options: TwurplePubSubOptions) => new PubSubClient(options)
		};
	}
}
