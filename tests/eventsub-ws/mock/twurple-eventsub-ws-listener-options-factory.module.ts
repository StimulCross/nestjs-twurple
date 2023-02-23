import { Module } from '@nestjs/common';
import { TwurpleEventsubWsListenerOptionsFactory } from './twurple-eventsub-ws-listener-options-factory';

@Module({
	providers: [TwurpleEventsubWsListenerOptionsFactory],
	exports: [TwurpleEventsubWsListenerOptionsFactory]
})
export class TwurpleEventsubWsListenerOptionsFactoryModule {}
