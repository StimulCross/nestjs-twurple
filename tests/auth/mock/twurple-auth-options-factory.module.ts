import { Module } from '@nestjs/common';
import { TwurpleAuthAppTokenProviderOptionsFactory } from './twurple-auth-app-token-provider-options.factory';
import { TwurpleAuthRefreshingProviderOptionsFactory } from './twurple-auth-refreshing-provider-options.factory';
import { TwurpleAuthStaticProviderOptionsFactory } from './twurple-auth-static-provider-options.factory';

@Module({
	providers: [
		TwurpleAuthStaticProviderOptionsFactory,
		TwurpleAuthRefreshingProviderOptionsFactory,
		TwurpleAuthAppTokenProviderOptionsFactory
	],
	exports: [
		TwurpleAuthStaticProviderOptionsFactory,
		TwurpleAuthRefreshingProviderOptionsFactory,
		TwurpleAuthAppTokenProviderOptionsFactory
	]
})
export class TwurpleAuthOptionsFactoryModule {}
