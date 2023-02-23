import { type TwurpleEventSubWsOptions } from './twurple-eventsub-ws-options.interface';

/**
 * Factory class to create Twurple EventSub WebSocket listener options.
 */
export interface TwurpleEventSubWsOptionsFactory {
	/**
	 * Creates Twurple EventSub WebSocket listener options.
	 */
	createTwurpleEventSubWsOptions(): TwurpleEventSubWsOptions | Promise<TwurpleEventSubWsOptions>;
}
