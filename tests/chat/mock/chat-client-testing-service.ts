import { Injectable } from '@nestjs/common';
import { ChatClient } from '@twurple/chat';
import { InjectChatClient } from '../../../packages/chat/src';

@Injectable()
export class ChatClientTestingService {
	constructor(@InjectChatClient() public readonly chatClient: ChatClient) {}
}
