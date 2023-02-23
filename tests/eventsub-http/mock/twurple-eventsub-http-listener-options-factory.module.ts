import { Module } from '@nestjs/common';
import { TwurpleEventsubHttpListenerOptionsFactory } from './twurple-eventsub-http-listener-options-factory';

@Module({
	providers: [TwurpleEventsubHttpListenerOptionsFactory],
	exports: [TwurpleEventsubHttpListenerOptionsFactory]
})
export class TwurpleEventsubHttpListenerOptionsFactoryModule {}
