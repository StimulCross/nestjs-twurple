import { Injectable } from '@nestjs/common';
import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';
import { type TwurpleEventSubWsOptions, type TwurpleEventSubWsOptionsFactory } from '../../../packages/eventsub-ws/src';
import { MOCK_CLIENT_ID, MOCK_CLIENT_SECRET } from '../../constants';

@Injectable()
export class TwurpleEventsubWsListenerOptionsFactory implements TwurpleEventSubWsOptionsFactory {
	async createTwurpleEventSubWsOptions(): Promise<TwurpleEventSubWsOptions> {
		return {
			apiClient: new ApiClient({
				authProvider: new RefreshingAuthProvider({
					clientId: MOCK_CLIENT_ID,
					clientSecret: MOCK_CLIENT_SECRET
				})
			})
		};
	}
}
