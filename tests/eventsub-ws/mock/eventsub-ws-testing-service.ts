import { Injectable } from '@nestjs/common';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { InjectEventSubWsListener } from '../../../packages/eventsub-ws/src';

@Injectable()
export class EventSubWsTestingService {
	constructor(@InjectEventSubWsListener() public readonly eventSubWsListener: EventSubWsListener) {}
}
