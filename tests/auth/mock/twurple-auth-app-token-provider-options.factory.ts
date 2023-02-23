import { Injectable } from '@nestjs/common';
import { type TwurpleAuthOptions, type TwurpleAuthOptionsFactory } from '../../../packages/auth/src';
import { MOCK_CLIENT_ID, MOCK_CLIENT_SECRET } from '../../constants';

@Injectable()
export class TwurpleAuthAppTokenProviderOptionsFactory implements TwurpleAuthOptionsFactory {
	async createTwurpleAuthOptions(): Promise<TwurpleAuthOptions> {
		return {
			type: 'app',
			clientId: MOCK_CLIENT_ID,
			clientSecret: MOCK_CLIENT_SECRET
		};
	}
}
