# NestJS Twurple EventSub WebSocket Listener

A NestJS wrapper around [@twurple/eventsub-ws](https://github.com/twurple/twurple/tree/main/packages/eventsub-ws) package.

This module can be used alone or in combination with other [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple) modules.

> **NOTE:** These packages require `twurple` version **6.0** or higher.

## Installation

This module can be used in combination with [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/auth) and [@nestjs-twurple/api](https://github.com/stimulcross/nestjs-twurple/tree/main/api) modules. Install them if necessary.

**yarn:**

```
yarn add @nestjs-twurple/eventsub-ws @twurple/auth @twurple/api @twurple/eventsub-ws
```

**npm:**

```
npm i @nestjs-twurple/eventsub-ws @twurple/auth @twurple/api @twurple/eventsub-ws
```

## Usage

_For basic information, check out the general documentation at the root of the repository [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple)._

_Also take a look at official `@twurple/eventsub-ws` [reference](https://twurple.js.org/reference/eventsub-ws) and guides: [Setting up an EventSub listener](https://twurple.js.org/docs/getting-data/eventsub/listener-setup.html) (skip HTTP listener part)._

### Import and Registration

The module must be register either with [register](https://github.com/stimulcross/nestjs-twurple#sync-module-configuration) or [registerAsync](https://github.com/stimulcross/nestjs-twurple#async-module-configuration) static methods.

To create an EventSub WebSocket listener, you must provide `TwurpleEventSubWsOptions`. The options below are directly extended from the [EventSubWsConfig](https://twurple.js.org/reference/eventsub-ws/interfaces/EventSubWsConfig.html) interface provided by `@twurple/eventsub-ws` package, so the example below may become outdated at some point.

```ts
interface TwurpleEventSubWsOptions {
	apiClient: ApiClient;
	logger?: Partial<LoggerOptions>;
	url?: string;
}
```

The best way to register the module is to use it with [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/auth) and [@nestjs-twurple/api](https://github.com/stimulcross/nestjs-twurple/tree/main/api) packages:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '@nestjs-twurple/auth';
import { TWURPLE_API_CLIENT, TwurpleApiModule } from '@nestjs-twurple/api';
import { TwurpleEventSubWsModule } from '@nestjs-twurple/eventsub-ws';
import { AuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';

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
		TwurpleApiModule.registerAsync({
			isGlobal: true,
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory: (authProvider: AuthProvider) => {
				// Here we are able to access the auth provider instance
				// provided by TwurpleAuthModule
				return { authProvider };
			}
		}),
		TwurpleEventSubWsModule.registerAsync({
			isGlobal: true,
			inject: [TWURPLE_API_CLIENT],
			useFactory: (apiClient: ApiClient) => {
				// Here we are able to access the API client instance
				// provided by TwurpleApiModule
				return { apiClient };
			}
		})
	]
})
export class AppModule {}
```

### Using the EventSubWsListener

The module internally creates an [EventSubWsListener](https://twurple.js.org/reference/eventsub-ws/classes/EventSubWsListener.html) instance. You can inject it anywhere you need it using the `@InjectEventSubWsListener()` decorator. For example, you can create `TwitchEventSubService` provider where you can listen to EventSub events and manage subscriptions. Note that before listening to channel events the user(s) must be registered in the auth provider.

```ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEventSubWsListener, TwurpleEventSubWsService } from '@nestjs-twurple/eventsub-ws';

@Injectable()
export class TwitchEventSubService implements OnApplicationBootstrap {
	constructor(@InjectEventSubWsListener() private readonly _eventSubListener) {}

	// You can use this NestJS hook to automatically connect
	// and subscribe to events on application start
	async onApplicationBootstrap(): Promise<void> {
		await this.start();
	}

	async start(): Promise<void> {
		await this._eventSubListener.start();

		// You can inject a service that manages users to get the data
		// that is required for subscriptions, such as user ID
		const userId = '123456789';
		const onlineSubscription = this._eventSubListener.subscribeToStreamOnlineEvents(userId, evt => {
			console.log(`${evt.broadcasterDisplayName} just went live!`);
		});
	}
}
```

You probably also want to store created subscription in a map/object/array to be able to stop them at any time:

```ts
await onlineSubscription.stop();
```

## Support
