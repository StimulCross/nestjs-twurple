import { type AccessToken, type RefreshConfig } from '@twurple/auth';

/**
 * The type of the Twurple auth provider.
 */
export type TwurpleAuthProviderType = 'app' | 'static' | 'refreshing';

export interface TwurpleAuthProviderBaseOptions {
	type: TwurpleAuthProviderType;
}

export interface TwurpleAuthAppTokenProviderOptions extends TwurpleAuthProviderBaseOptions {
	type: 'app';
	clientId: string;
	clientSecret: string;
	impliedScopes?: string[];
}

/**
 * Twurple static auth provider options.
 */
export interface TwurpleAuthStaticProviderOptions extends TwurpleAuthProviderBaseOptions {
	type: 'static';
	clientId: string;
	accessToken: string | AccessToken;
	scopes?: string[];
}

/**
 * Twurple self-refreshing auth provider options.
 */
export interface TwurpleAuthRefreshingProviderOptions extends TwurpleAuthProviderBaseOptions, RefreshConfig {
	type: 'refreshing';
}

/**
 * Twurple auth provider options.
 *
 * On of the following auth provider type must be specified: `app`, `static`, or `refreshing`. Depending on the type,
 * the wrapper will internally create the corresponding Twurple auth provider instance: `AppTokenAuthProvider`,
 * `StaticAuthProvider`, or `RefreshingAuthProvider`.
 */
export type TwurpleAuthOptions =
	| TwurpleAuthAppTokenProviderOptions
	| TwurpleAuthStaticProviderOptions
	| TwurpleAuthRefreshingProviderOptions;
