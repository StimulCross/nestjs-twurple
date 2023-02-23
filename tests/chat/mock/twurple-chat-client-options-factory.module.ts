import { Module } from '@nestjs/common';
import { TwurpleChatClientOptionsFactory } from './twurple-chat-client-options-factory';

@Module({
	providers: [TwurpleChatClientOptionsFactory],
	exports: [TwurpleChatClientOptionsFactory]
})
export class TwurpleChatClientOptionsFactoryModule {}
