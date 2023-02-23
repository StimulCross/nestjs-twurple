import { type TwurpleAuthOptions } from './twurple-auth-options.interfaces';

/**
 * Factory class to create Twurple auth provider options.
 */
export interface TwurpleAuthOptionsFactory {
	/**
	 * Creates Twurple auth provider options.
	 */
	createTwurpleAuthOptions(): TwurpleAuthOptions | Promise<TwurpleAuthOptions>;
}
