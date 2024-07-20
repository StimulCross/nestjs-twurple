import { Injectable } from '@nestjs/common';
import { StaticAuthProvider } from '@twurple/auth';
import { type TwurpleChatOptions, type TwurpleChatOptionsFactory } from '../../../packages/chat/src';
import { MOCK_ACCESS_TOKEN, MOCK_CLIENT_ID } from '../../constants';

@Injectable()
export class TwurpleChatClientOptionsFactory implements TwurpleChatOptionsFactory {
	createTwurpleChatOptions(): TwurpleChatOptions {
		return {
			authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
		};
	}
}
