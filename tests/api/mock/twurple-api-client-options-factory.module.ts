import { Module } from '@nestjs/common';
import { TwurpleApiClientOptionsFactory } from './twurple-api-client-options-factory';

@Module({
	providers: [TwurpleApiClientOptionsFactory],
	exports: [TwurpleApiClientOptionsFactory]
})
export class TwurpleApiClientOptionsFactoryModule {}
