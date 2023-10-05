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
	/**
	 * Twurple authentication provider type.
	 *
	 * Possible values are "app", "static", and "refreshing".
	 */
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

	/**
	 * If this argument is given, the scopes need to be correct, or weird things might happen.
	 * If it's not (i.e. it's `undefined`), we fetch the correct scopes for you.
	 *
	 * If you can't exactly say which scopes your token has, don't use this parameter / set it to `undefined`.
	 */
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
 * One of the following auth provider type must be specified: `app`, `static`, or `refreshing`. Depending on the type,
 * the wrapper will internally create the corresponding Twurple auth provider instance:
 * [AppTokenAuthProvider](https://twurple.js.org/reference/auth/classes/AppTokenAuthProvider.html),
 * [StaticAuthProvider](https://twurple.js.org/reference/auth/classes/StaticAuthProvider.html),
 * or [RefreshingAuthProvider](https://twurple.js.org/reference/auth/classes/RefreshingAuthProvider.html).
 */
export type TwurpleAuthOptions =
	| TwurpleAuthAppTokenProviderOptions
	| TwurpleAuthStaticProviderOptions
	| TwurpleAuthRefreshingProviderOptions;
