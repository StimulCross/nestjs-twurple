import { Injectable } from '@nestjs/common';
import { type TwurpleAuthOptionsFactory, type TwurpleAuthOptions } from '../../../packages/auth/src';
import { MOCK_ACCESS_TOKEN, MOCK_CLIENT_ID } from '../../constants';

@Injectable()
export class TwurpleAuthStaticProviderOptionsFactory implements TwurpleAuthOptionsFactory {
	async createTwurpleAuthOptions(): Promise<TwurpleAuthOptions> {
		return {
			type: 'static',
			clientId: MOCK_CLIENT_ID,
			accessToken: MOCK_ACCESS_TOKEN
		};
	}
}
