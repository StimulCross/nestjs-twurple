import { Inject } from '@nestjs/common';
import { TWURPLE_EVENTSUB_HTTP_LISTENER } from '../constants';

/**
 * Injects `EventSubMiddleware` instance imported from `@twurple/eventsub-http`.
 *
 * @example
 * ```ts
 * import { EventSubMiddleware } from '@twurple/eventsub-http';
 *
 * @Injectable()
 * export class CustomProvider {
 *     constructor(@InjectEventSubHttpListener() private readonly _eventSubHttpListener: EventSubMiddleware) {}
 * }
 */
export const InjectEventSubHttpListener = (): ParameterDecorator => Inject(TWURPLE_EVENTSUB_HTTP_LISTENER);
