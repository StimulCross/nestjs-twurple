import { Injectable } from '@nestjs/common';
import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';
import { type TwurpleEventSubHttpOptionsFactory } from '../../../packages/eventsub-http/src/interfaces/twurple-eventsub-http-options-factory-interface';
import { type TwurpleEventSubHttpOptions } from '../../../packages/eventsub-http/src/interfaces/twurple-eventsub-http-options.interface';
import { MOCK_CLIENT_ID, MOCK_CLIENT_SECRET, MOCK_HOST_NAME, SECRET } from '../../constants';

@Injectable()
export class TwurpleEventsubHttpListenerOptionsFactory implements TwurpleEventSubHttpOptionsFactory {
	async createTwurpleEventSubHttpOptions(): Promise<TwurpleEventSubHttpOptions> {
		return {
			apiClient: new ApiClient({
				authProvider: new RefreshingAuthProvider({
					clientId: MOCK_CLIENT_ID,
					clientSecret: MOCK_CLIENT_SECRET
				})
			}),
			hostName: MOCK_HOST_NAME,
			secret: SECRET,
			legacySecrets: false
		};
	}
}
