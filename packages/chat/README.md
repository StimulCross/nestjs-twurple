# NestJS Twurple Chat

A NestJS wrapper for [@twurple/chat](https://github.com/twurple/twurple/tree/main/packages/chat) package.

This module can be used alone or in combination with other [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple) modules.

> **NOTE:** This package requires `twurple` version **6.0** or higher.

## Installation

This module can be used in combination with [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/auth) module. Install it if necessary.

**yarn:**

```
yarn add @nestjs-twurple/chat @twurple/auth @twurple/chat
```

**npm:**

```
npm i @nestjs-twurple/chat @twurple/auth @twurple/chat
```

## Usage

_For basic information, check out the general documentation at the root of the repository [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple)._

_Also take a look at official `@twurple/chat` [reference](https://twurple.js.org/reference/chat) and guides: [Connecting to Chat](https://twurple.js.org/docs/getting-data/chat/connecting-to-chat.html), [Listening to chat events](https://twurple.js.org/docs/getting-data/chat/listening-to-events.html)._

### Import and Registration

The module must be register either with [register](https://github.com/stimulcross/nestjs-twurple#sync-module-configuration) or [registerAsync](https://github.com/stimulcross/nestjs-twurple#async-module-configuration) static methods.

To create a chat client, you can provide `TwurpleChatOptions`. The options below are directly extended from the [ChatClientOptions](https://twurple.js.org/reference/chat/interfaces/ChatClientOptions.html) interface provided by `@twurple/chat` package, so the example below may become outdated at some point.

```ts
interface TwurpleChatOptions {
	authProvider?: AuthProvider;
	readOnly?: boolean;
	legacyScopes?: boolean;
	logger?: Partial<LoggerOptions>;
	ssl?: boolean;
	hostName?: string;
	webSocket?: boolean;
	connectionOptions?: WebSocketConnectionOptions;
	requestMembershipEvents?: boolean;
	channels?: ResolvableValue<string[]>;
	isAlwaysMod?: boolean;
	botLevel?: TwitchBotLevel;
	authIntents?: string[];
}
```

Example of using `registerAsync` static method:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshingAuthProvider } from '@twurple/auth';
import { TwurpleChatModule } from '@nestjs-twurple/chat';

@Module({
	imports: [
		ConfigModule.register({ isGlobal: true }),
		TwurpleChatModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					authProvider: new RefreshingAuthProvider({
						// ...
					}),
					isAlwaysMod: true,
					requestMembershipEvents: true
				};
			}
		})
	]
})
export class AppModule {}
```

You can also use `TwurpleAuthModule` from [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/auth) package to inject an auth provider:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '@nestjs-twurple/auth';
import { TwurpleChatModule } from '@nestjs-twurple/chat';
import { AuthProvider } from '@twurple/auth';

@Module({
	imports: [
		ConfigModule.register({ isGlobal: true }),
		TwurpleAuthModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					type: 'refreshing',
					clientId: configService.get('TWITCH_CLIENT_ID'),
					clientSecret: configService.get('TWITCH_CLIENT_SECRET'),
					onRefresh: async (userId, token) => {
						// Handle token refresh
					}
				};
			}
		}),
		TwurpleChatModule.registerAsync({
			isGlobal: true,
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory: (authProvider: AuthProvider) => {
				// Here we are able to access the auth provider instance
				// provided by TwurpleAuthModule
				return {
					authProvider,
					isAlwaysMod: true,
					requestMembershipEvents: true
				};
			}
		})
	]
})
export class AppModule {}
```

> **NOTE:** If you need anonymous read-only connection, do not pass an auth provider.

### Using the ChatClient

The module internally creates a [ChatClient](https://twurple.js.org/reference/chat/classes/ChatClient.html) instance. You can inject it anywhere you need it using the `@InjectChatClient()` decorator. For example, you can create `TwitchChatService` provider where you can listen to chat events, manage connection, send messages, and so on:

```ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ChatClient } from '@twurple/chat';
import { InjectChatClient } from '@nestjs-twurple/chat';

@Injectable()
export class TwitchChatService implements OnApplicationBootstrap {
	// Inject ChatClient instance
	constructor(@InjectChatClient() private readonly _chatClient: ChatClient) {
		// Join channels after successfull authentication
		// You can inject a service that manages users/channels to get usernames
		this._chatClient.onAuthenticationSuccess(async () => {
			await this._chatClient.join('<CHANNEL_NAME>');
		});

		// Setup listeners
		this._chatClient.onMessage(async (channel: string, user: string, text: string, msg: TwitchPrivateMessage) => {
			console.log(`@${user}: ${text}`);
		});

		// Other listeners...
	}

	// You can use this NestJS hook to automatically connect
	// and join channels on application start
	async onApplicationBootstrap(): Promise<void> {
		await this.start();
	}

	async start(): Promise<void> {
		await this._chatClient.connect();
	}

	async stop(): Promise<void> {
		this._chatClient.quit();
	}

	// Other methods...
}
```

Alternatively, you can use `TWURPLE_CHAT_CLIENT` token to inject the `ChatClient` instance to your custom providers or factories:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { ChatClient } from '@twurple/chat';
import { TWURPLE_CHAT_CLIENT } from './constants';

@Injectable()
export class TwitchChatService implements OnApplicationBootstrap {
	// Inject ChatClient instance
	constructor(@Inject(TWURPLE_CHAT_CLIENT) private readonly _chatClient: ChatClient) {}
}
```

## Support
