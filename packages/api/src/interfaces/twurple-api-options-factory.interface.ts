import { type TwurpleApiOptions } from './twurple-api-options.interface';

/**
 * Factory class to create Twurple API client options.
 */
export interface TwurpleApiOptionsFactory {
	/**
	 * Creates Twurple API client options.
	 */
	createTwurpleApiOptions(): TwurpleApiOptions | Promise<TwurpleApiOptions>;
}
