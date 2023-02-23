import { type EventSubMiddlewareConfig } from '@twurple/eventsub-http';

/**
 * Twurple EventSub HTTP listener extra options.
 */
export interface TwurpleEventSubHttpExtraOptions {
	/**
	 * Whether to automatically apply handlers on module initialization.
	 *
	 * Set this to `false` if you want to apply them manually.
	 *
	 * Defaults to `true`.
	 */
	applyHandlersOnModuleInit?: boolean;
}

/**
 * Twurple EventSub HTTP listener options.
 */
export type TwurpleEventSubHttpOptions = EventSubMiddlewareConfig & TwurpleEventSubHttpExtraOptions;
