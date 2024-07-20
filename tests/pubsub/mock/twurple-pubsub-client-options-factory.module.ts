import { Module } from '@nestjs/common';
import { TwurplePubSubClientOptionsFactory } from './twurple-pubsub-client-options-factory';

@Module({
	providers: [TwurplePubSubClientOptionsFactory],
	exports: [TwurplePubSubClientOptionsFactory]
})
export class TwurplePubSubClientOptionsFactoryModule {}
