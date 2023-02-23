import { type TwurpleEventSubHttpOptions } from './twurple-eventsub-http-options.interface';

/**
 * Factory class to create Twurple EventSub HTTP listener options.
 */
export interface TwurpleEventSubHttpOptionsFactory {
	/**
	 * Factory method to create Twurple EventSub HTTP listener options.
	 */
	createTwurpleEventSubHttpOptions(): TwurpleEventSubHttpOptions | Promise<TwurpleEventSubHttpOptions>;
}
