import { Injectable } from '@nestjs/common';
import { StaticAuthProvider } from '@twurple/auth';
import { type TwurplePubSubOptionsFactory, type TwurplePubSubOptions } from '../../../packages/pubsub/src';
import { MOCK_ACCESS_TOKEN, MOCK_CLIENT_ID } from '../../constants';

@Injectable()
export class TwurplePubSubClientOptionsFactory implements TwurplePubSubOptionsFactory {
	createTwurplePubSubOptions(): TwurplePubSubOptions {
		return {
			authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
		};
	}
}
