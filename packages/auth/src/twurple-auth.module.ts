import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { AppTokenAuthProvider, type AuthProvider, RefreshingAuthProvider, StaticAuthProvider } from '@twurple/auth';
import { TWURPLE_AUTH_OPTIONS, TWURPLE_AUTH_PROVIDER } from './constants';
import {
	type TwurpleAuthModuleAsyncOptions,
	type TwurpleAuthModuleOptions
} from './interfaces/twurple-auth-module-options.interface';
import { type TwurpleAuthOptionsFactory } from './interfaces/twurple-auth-options-factory.interface';
import { type TwurpleAuthOptions } from './interfaces/twurple-auth-options.interfaces';

/**
 * Twurple auth module.
 *
 * The module must be registered using either `register` or `registerAsync` static methods.
 */
@Module({})
export class TwurpleAuthModule {
	/**
	 * Registers the module synchronously by direct options passing.
	 *
	 * @param options Twurple auth module options.
	 */
	public static register(options: TwurpleAuthModuleOptions): DynamicModule {
		const authProvider = TwurpleAuthModule._createAuthProvider();

		return {
			global: options.isGlobal,
			module: TwurpleAuthModule,
			providers: [TwurpleAuthModule._createOptionsProvider(options), authProvider],
			exports: [authProvider]
		};
	}

	/**
	 * Registers the module asynchronously using one of the following factories: "useFactory", "useExisting", or
	 * "useClass".
	 *
	 * @param options Twurple auth module async options.
	 */
	public static registerAsync(options: TwurpleAuthModuleAsyncOptions): DynamicModule {
		const authProvider = TwurpleAuthModule._createAuthProvider();

		return {
			global: options.isGlobal,
			imports: options.imports,
			module: TwurpleAuthModule,
			providers: [...TwurpleAuthModule._createAsyncOptionsProviders(options), authProvider],
			exports: [authProvider]
		};
	}

	private static _createOptionsProvider(options: TwurpleAuthOptions): Provider<TwurpleAuthOptions> {
		return {
			provide: TWURPLE_AUTH_OPTIONS,
			useValue: options
		};
	}

	private static _createAsyncOptionsProviders(options: TwurpleAuthModuleAsyncOptions): Provider[] {
		if (options.useExisting || options.useFactory) {
			return [TwurpleAuthModule._createAsyncOptionsProvider(options)];
		}

		return [
			TwurpleAuthModule._createAsyncOptionsProvider(options),
			{
				provide: options.useClass!,
				useClass: options.useClass!
			}
		];
	}

	private static _createAsyncOptionsProvider(options: TwurpleAuthModuleAsyncOptions): Provider<TwurpleAuthOptions> {
		if (options.useFactory) {
			return {
				provide: TWURPLE_AUTH_OPTIONS,
				useFactory: options.useFactory,
				inject: options.inject ?? []
			};
		}

		return {
			provide: TWURPLE_AUTH_OPTIONS,
			useFactory: async (factory: TwurpleAuthOptionsFactory) => await factory.createTwurpleAuthOptions(),
			inject: [options.useExisting ?? options.useClass!]
		};
	}

	private static _createAuthProviderClient(options: TwurpleAuthOptions): AuthProvider {
		switch (options.type) {
			case 'refreshing':
				return new RefreshingAuthProvider({
					clientId: options.clientId,
					clientSecret: options.clientSecret,
					redirectUri: options.redirectUri,
					appImpliedScopes: options.appImpliedScopes
				});

			case 'static': {
				return new StaticAuthProvider(options.clientId, options.accessToken, options.scopes);
			}

			case 'app': {
				return new AppTokenAuthProvider(options.clientId, options.clientSecret, options.impliedScopes);
			}

			default:
				throw new Error(
					'Invalid auth provider type. The provider type must be "app", "refreshing", or "static".'
				);
		}
	}

	private static _createAuthProvider(): Provider<AuthProvider> {
		return {
			provide: TWURPLE_AUTH_PROVIDER,
			inject: [TWURPLE_AUTH_OPTIONS],
			useFactory: (options: TwurpleAuthOptions) => TwurpleAuthModule._createAuthProviderClient(options)
		};
	}
}
