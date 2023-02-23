import { type TwurpleChatOptions } from './twurple-chat-options.interface';

/**
 * Factory class to create Twurple chat client options.
 */
export interface TwurpleChatOptionsFactory {
	/**
	 * Creates Twurple chat client options.
	 */
	createTwurpleChatOptions(): TwurpleChatOptions | Promise<TwurpleChatOptions>;
}
