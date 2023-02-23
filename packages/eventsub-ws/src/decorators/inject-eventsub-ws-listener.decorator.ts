import { Inject } from '@nestjs/common';
import { TWURPLE_EVENTSUB_WS_LISTENER } from '../constants';

/**
 * Injects `EventSubWsListener` instance imported from `@twurple/eventsub-ws`.
 *
 * @example
 * ```ts
 * import { EventSubWsListener } from '@twurple/eventsub-ws';
 *
 * @Injectable()
 * export class CustomProvider {
 *     constructor(@InjectEventSubWsListener() private readonly _eventSubWsListener: EventSubWsListener) {}
 * }
 */
export const InjectEventSubWsListener = (): ParameterDecorator => Inject(TWURPLE_EVENTSUB_WS_LISTENER);
