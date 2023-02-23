import { type TwurplePubSubOptions } from './twurple-pubsub-options.interface';

/**
 * Factory class to create Twurple PubSub client options.
 */
export interface TwurplePubSubOptionsFactory {
	/**
	 * Creates Twurple PubSub client options.
	 */
	createTwurplePubSubOptions(): TwurplePubSubOptions | Promise<TwurplePubSubOptions>;
}
