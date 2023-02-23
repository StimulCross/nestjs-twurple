import { Inject } from '@nestjs/common';
import { TWURPLE_PUBSUB_CLIENT } from '../constants';

/**
 * Injects `PubSubClient` instance imported from `@twurple/pubsub`.
 *
 * @example
 * ```ts
 * import { PubSubClient } from '@twurple/pubsub';
 *
 * @Injectable()
 * export class CustomProvider {
 *     constructor(@InjectPubSubClient() private readonly _pubSubClient: PubSubClient) {}
 * }
 */
export const InjectPubSubClient = (): ParameterDecorator => Inject(TWURPLE_PUBSUB_CLIENT);
