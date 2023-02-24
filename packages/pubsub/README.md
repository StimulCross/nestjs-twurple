# NestJS Twurple PubSub

A NestJS wrapper for [@twurple/pubsub](https://github.com/twurple/twurple/tree/main/packages/pubsub) package.

This module can be used alone or in combination with other [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple) modules.

> **NOTE:** This package requires `twurple` version **6.0** or higher.

## Installation

This module can be used in combination with [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/auth) module. Install it if necessary.

**yarn:**

```
yarn add @nestjs-twurple/pubsub @twurple/auth @twurple/pubsub
```

**npm:**

```
npm i @nestjs-twurple/pubsub @twurple/auth @twurple/pubsub
```

## Usage

_For basic information, check out the general documentation at the root of the repository [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple)._

_Also take a look at the official `@twurple/pubsub` [reference](https://twurple.js.org/reference/pubsub) and guides: [Listening to PubSub topics](https://twurple.js.org/docs/getting-data/pubsub/listening-to-topics.html)._

### Import and Registration

The module must be register either with [register](https://github.com/stimulcross/nestjs-twurple#sync-module-configuration) or [registerAsync](https://github.com/stimulcross/nestjs-twurple#async-module-configuration) static methods.

To create a PubSub client, you must provide `TwurplePubSubOptions`. The options below are directly extended from the [PubSubClientConfig](https://twurple.js.org/reference/pubsub/interfaces/PubSubClientConfig.html) interface provided by `@twurple/pubsub` package, so the example below may become outdated at some point.

```ts
interface TwurplePubSubOptions {
	authProvider: AuthProvider;
	logger?: Partial<LoggerOptions>;
	wsOptions?: WebSocketClientOptions;
}
```

Example of using `registerAsync` static method:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshingAuthProvider } from '@twurple/auth';
import { TwurplePubSubModule } from '@nestjs-twurple/pubsub';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TwurplePubSubModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					authProvider: new RefreshingAuthProvider({
						// ...
					})
				};
			}
		})
	]
})
export class AppModule {}
```

You can also use `TwurpleAuthModule` from [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/auth) package to inject an auth provider:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '@nestjs-twurple/auth';
import { TwurplePubSubModule } from '@nestjs-twurple/pubsub';
import { AuthProvider } from '@twurple/auth';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
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
		TwurplePubSubModule.registerAsync({
			isGlobal: true,
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory: (authProvider: AuthProvider) => {
				// Here we are able to access the auth provider instance
				// provided by TwurpleAuthModule above
				return { authProvider };
			}
		})
	]
})
export class AppModule {}
```

### Using the PubSubClient

The module internally creates a [PubSubClient](https://twurple.js.org/reference/chat/classes/ChatClient.html) instance. You can inject it anywhere you need it using `@InjectPubSubClient()` decorator. For example, you can create `TwitchPubSubService` provider where you can listen to PubSub events. Note that before listening to channel events the user(s) must be registered in the auth provider.

```ts
import { Injectable } from '@nestjs/common';
import { InjectPubSubClient } from '@nestjs-twurple/pubsub';
import { PubSubClient, type PubSubSubscriptionMessage } from '@twurple/pubsub';

@Injectable()
export class TwitchPubSubService {
	// Inject PubSubClient
	constructor(@InjectPubSubClient() private readonly _pubSubClient: PubSubClient) {
		const subscriptionHandler = this._pubSubClient.onSubscription(userId, (message: PubSubSubscriptionMessage) => {
			console.log(`${message.userDisplayName} just subscribed!`);
		});

		// Other listeners...
	}

	// Other methods...
}
```

Alternatively, you can use `TWURPLE_CHAT_CLIENT` token to inject the `ChatClient` instance to your custom providers or factories:

```ts
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { TWURPLE_PUBSUB_CLIENT } from '@nestjs-twurple/pubsub';
import { PubSubClient } from '@twurple/pubsub';

@Injectable()
export class TwitchChatService implements OnApplicationBootstrap {
	// Inject PubSubClient
	constructor(@Inject(TWURPLE_PUBSUB_CLIENT) private readonly _pubSubClient: PubSubClient) {}
}
```

## Support
