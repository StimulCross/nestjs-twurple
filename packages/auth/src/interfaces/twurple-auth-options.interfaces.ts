import { type AccessToken } from '@twurple/auth';

/**
 * The type of the Twurple auth provider.
 */
export type TwurpleAuthProviderType = 'app' | 'static' | 'refreshing';

export interface TwurpleAuthProviderClientCredentials {
	/**
	 * The client ID of your application.
	 */
	clientId: string;

	/**
	 * The client secret of your application.
	 */
	clientSecret: string;
}

export interface TwurpleAuthProviderBaseOptions {
	type: TwurpleAuthProviderType;
}

export interface TwurpleAuthAppTokenProviderOptions
	extends TwurpleAuthProviderBaseOptions,
		TwurpleAuthProviderClientCredentials {
	type: 'app';

	/**
	 * The scopes that are implied for your application, for example an extension that is allowed to access
	 * subscriptions.
	 */
	impliedScopes?: string[];
}

/**
 * Twurple static auth provider options.
 */
export interface TwurpleAuthStaticProviderOptions
	extends TwurpleAuthProviderBaseOptions,
		Pick<TwurpleAuthProviderClientCredentials, 'clientId'> {
	type: 'static';

	/**
	 * The access token to provide.
	 *
	 * You need to obtain one using one of the [Twitch OAuth flows](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/).
	 */
	accessToken: string | AccessToken;
	scopes?: string[];
}

/**
 * Twurple self-refreshing auth provider options.
 */
export interface TwurpleAuthRefreshingProviderOptions
	extends TwurpleAuthProviderBaseOptions,
		TwurpleAuthProviderClientCredentials {
	type: 'refreshing';

	/**
	 * A valid redirect URI for your application.
	 *
	 * Only required if you use `addUserForCode`.
	 */
	redirectUri?: string;

	/**
	 * The scopes to be implied by the provider's app access token.
	 */
	appImpliedScopes?: string[];
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
