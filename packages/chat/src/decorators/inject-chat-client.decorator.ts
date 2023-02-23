import { Inject } from '@nestjs/common';
import { TWURPLE_CHAT_CLIENT } from '../constants';

/**
 * Injects `ChatClient` instance imported from `@twurple/chat`.
 *
 * @example
 * ```ts
 * import { ChatClient } from '@twurple/chat';
 *
 * @Injectable()
 * export class CustomProvider {
 *     constructor(@InjectChatClient() private readonly _chatClient: ChatClient) {}
 * }
 */
export const InjectChatClient = (): ParameterDecorator => Inject(TWURPLE_CHAT_CLIENT);
