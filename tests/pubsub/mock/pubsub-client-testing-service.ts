import { Injectable } from '@nestjs/common';
import { PubSubClient } from '@twurple/pubsub';
import { InjectPubSubClient } from '../../../packages/pubsub/src';

@Injectable()
export class PubSubClientTestingService {
	constructor(@InjectPubSubClient() public readonly pubSubClient: PubSubClient) {}
}
