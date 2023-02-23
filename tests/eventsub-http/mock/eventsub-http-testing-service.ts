import { Injectable } from '@nestjs/common';
import { EventSubMiddleware } from '@twurple/eventsub-http';
import { InjectEventSubHttpListener } from '../../../packages/eventsub-http/src';

@Injectable()
export class EventsubHttpTestingService {
	constructor(@InjectEventSubHttpListener() public readonly eventSubHttpListener: EventSubMiddleware) {}
}
