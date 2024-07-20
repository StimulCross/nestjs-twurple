import { Injectable } from '@nestjs/common';
import { StaticAuthProvider } from '@twurple/auth';
import { type TwurpleApiOptions, type TwurpleApiOptionsFactory } from '../../../packages/api/src';
import { MOCK_ACCESS_TOKEN, MOCK_CLIENT_ID } from '../../constants';

@Injectable()
export class TwurpleApiClientOptionsFactory implements TwurpleApiOptionsFactory {
	createTwurpleApiOptions(): TwurpleApiOptions {
		return {
			authProvider: new StaticAuthProvider(MOCK_CLIENT_ID, MOCK_ACCESS_TOKEN)
		};
	}
}
