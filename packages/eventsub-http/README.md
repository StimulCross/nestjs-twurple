# NestJS Twurple EventSub HTTP Listener

A NestJS wrapper for [@twurple/eventsub-http](https://github.com/twurple/twurple/tree/main/packages/eventsub-http) package.

This module can be used alone or in combination with other [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple) modules.

> **NOTE:** These packages require `twurple` version **6.0** or higher.

> **WARNING:** Twurple EventSub HTTP module does **NOT** support **Fastify** platform because underlying `@twurple/eventsub-http` applies Express-like middleware to handle requests. To make it work, your app must be based on **Express** platform.

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
    -   [Import and Registration](#import-and-registration)
    -   [Using the EventSubMiddleware](#using-the-eventsubmiddleware)
    -   [Important Notes](#important-notes)
        -   [Applying Express App](#applying-express-app)
        -   [Making the Listener Ready to Subscribe](#making-the-listener-ready-to-subscribe)
        -   [Request Body Consuming](#request-body-consuming)
-   [Support](#support)

## Installation

This module can be used in combination with [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/auth) and [@nestjs-twurple/api](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/api) modules. Install them if necessary.

**yarn:**

```
yarn add @nestjs-twurple/eventsub-http @twurple/auth @twurple/api @twurple/eventsub-http
```

**npm:**

```
npm i @nestjs-twurple/eventsub-http @twurple/auth @twurple/api @twurple/eventsub-http
```

## Usage

_For basic information, check out the general documentation at the root of the repository [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple)._

_Also take a look at official `@twurple/eventsub-http` [reference](https://twurple.js.org/reference/eventsub-http) and guides: [Setting up an EventSub listener](https://twurple.js.org/docs/getting-data/eventsub/listener-setup.html)._

### Import and Registration

The module must be register either with [register](https://github.com/stimulcross/nestjs-twurple#sync-module-configuration) or [registerAsync](https://github.com/stimulcross/nestjs-twurple#async-module-configuration) static methods.

To create an EventSub HTTP listener, you must provide `TwurpleEventSubHttpOptions`. Some options below are directly extended from the [EventSubMiddlewareConfig](https://twurple.js.org/reference/eventsub-http/interfaces/EventSubMiddlewareConfig.html) interface provided by `@twurple/eventsub-http` package, so the example below may become outdated at some point.

```ts
interface TwurpleEventSubHttpOptions {
	applyHandlersOnModuleInit?: boolean;
	// The options below directly extended from EventSubMiddlewareConfig
	apiClient: ApiClient;
	hostName: string;
	secret: string;
	legacySecrets?: boolean;
	strictHostCheck?: boolean;
	pathPrefix?: string;
	usePathPrefixInHandlers?: boolean;
	logger?: Partial<LoggerOptions>;
}
```

The best way to register the module is to use it with [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/auth) and [@nestjs-twurple/api](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/api) packages:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '@nestjs-twurple/auth';
import { TWURPLE_API_CLIENT, TwurpleApiModule } from '@nestjs-twurple/api';
import { TwurpleEventSubHttpModule } from '@nestjs-twurple/eventsub-http';
import { AuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';

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
		TwurpleApiModule.registerAsync({
			isGlobal: true,
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory: (authProvider: AuthProvider) => {
				return { authProvider };
			}
		}),
		TwurpleEventSubHttpModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService, TWURPLE_API_CLIENT],
			useFactory: (configService: ConfigService, apiClient: ApiClient) => {
				return {
					// `true` is the default value here
					applyHandlersOnModuleInit: true,
					// Access ApiClient instance from the TwurpleApiModule
					apiClient,
					secret: configService.get('TWITCH_EVENTSUB_SECRET'),
					hostName: configService.get('HOST_NAME'),
					pathPrefix: configService.get<string>('TWITCH_EVENTSUB_PATH'),
					legacySecrets: false
				};
			}
		})
	]
})
export class AppModule {}
```

### Using the EventSubMiddleware

The module internally creates an [EventSubMiddleware](https://twurple.js.org/reference/eventsub-http/classes/EventSubMiddleware.html) instance. You can inject it anywhere you need it using the `@InjectEventSubHttpListener()` decorator. For example, you can create `TwitchEventSubService` provider where you can listen to EventSub events and manage subscriptions:

```ts
import { Injectable } from '@nestjs/common';
import { EventSubMiddleware } from '@twurple/eventsub-http';
import { InjectEventSubHttpListener } from '@nestjs-twurple/eventsub-http';

@Injectable()
export class TwitchEventSubService {
	constructor(@InjectEventSubHttpListener() private readonly _eventSubListener: EventSubMiddleware) {}
}
```

### Important Notes

#### Applying Express App

`EventSubMiddleware` requires you to pass the Express app so that it can register the handlers. By default, the `TwurpleEventSubHttpModule` will automatically get the underlying Express app and pass it to the `apply()` method. If you want to apply [manually](https://twurple.js.org/docs/getting-data/eventsub/express.html), you should pass `applyHandlersOnModuleInit: false` in the module options. Then you can access the underlying Express app using [HttpAdapterHost](https://docs.nestjs.com/faq/http-adapter) from `@nestjs/core`:

```ts
import { Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { InjectEventSubHttpListener } from '@nestjs-twurple/eventsub-http';
import { EventSubMiddleware } from '@twurple/eventsub-http';

@Injectable()
export class TwitchEventSubService {
	constructor(
		private readonly _httpAdapterHost: HttpAdapterHost,
		@InjectEventSubHttpListener() private readonly _eventSubListener: EventSubMiddleware
	) {
		// Get Express app from HTTP adapter
		const app = this._httpAdapterHost.httpAdapter.getInstance();

		// Pass the app to the #apply() method
		this._eventSubListener.apply(app);
	}
}
```

#### Making the Listener Ready to Subscribe

Finally, before subscribing to events, you need to mark listener as ready for subscribing to events by calling `markAsReady()` method. Note that this method must be called _after_ NestJS started listening for connections. In other words, you must call this method after `await app.listen()` in your boostrap function.

You can do this directly in the bootstrap function (usually `main.ts` file):

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TwitchEventSubService } from './twitch-eventsub';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(3000);

	// This is a custom provider that we created specially
	// for handling EventSub events and manage subscription
	const twitchEventSubService = app.get(TwitchEventSubService);
	await twitchEventSubService.start();
}

bootstrap();
```

```ts
import { Injectable } from '@nestjs/common';
import { InjectEventSubHttpListener } from '@nestjs-twurple/eventsub-http';
import { EventSubMiddleware } from '@twurple/eventsub-http';

@Injectable()
export class TwitchEventSubService {
	constructor(@InjectEventSubHttpListener() private readonly _eventSubListener: EventSubMiddleware) {}

	// We call this method after app start
	async start(): Promise<void> {
		// Mark EventSub as ready
		await this._eventSubListener.markAsReady();

		// You probably want also inject a service into this provider that manages
		// users to get the data that is required for subscriptions, such their user ID
		const userId = '<USER_ID>';
		const onlineSubscription = this._eventSubListener.onStreamOnline(userId, evt => {
			console.log(`${evt.broadcasterDisplayName} just went live!`);
		});
	}
}
```

An even better way is to use [events](https://docs.nestjs.com/techniques/events):

```ts
import { NestFactory } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(3000);

	// Get event emitter from the DI container
	const eventEmitter = app.get(EventEmitter2);
	// Emit start event
	// You'd better use constants to avoid misspelling
	eventEmitter.emit(APP_START_EVENT);
}

bootstrap();
```

```ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectEventSubHttpListener } from '@nestjs-twurple/eventsub-http';
import { EventSubMiddleware } from '@twurple/eventsub-http';

@Injectable()
export class TwitchEventSubService {
	constructor(@InjectEventSubHttpListener() private readonly _eventSubListener: EventSubMiddleware) {}

	// Handle app start event
	@OnEvent(APP_START_EVENT)
	private async _onAppStart(): Promise<void> {
		await this.start();
	}

	async start(): Promise<void> {
		// Mark EventSub as ready
		await this._eventSubListener.markAsReady();

		// You can inject a service that manages users to get the data
		// that is required for subscriptions, such as their IDs
		const userId = '<USER_ID>';
		const onlineSubscription = this._eventSubListener.onStreamOnline(userId, evt => {
			console.log(`${evt.broadcasterDisplayName} just went live!`);
		});
	}
}
```

You probably also want to store created subscription in a map/object/array to be able to stop them at any time:

```ts
await onlineSubscription.stop();
```

#### Request Body Consuming

Twurple's EventSub event handler expects **non-consumed** body. So you should disable global body parser middleware.

```ts
async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bodyParser: false });
	await app.listen(3000);
}
```

Dumb workaround:

```ts
import { ConfigService } from '@nestjs/config';
import { json } from 'body-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bodyParser: false });

	// Apply body parser for all routes except for EventSub path
	// It must be the same path as you specified in TwurpleEventSubHttpModule options
	app.use((req: Request, res: Response, next: NextFunction) => {
		if (req.path.includes('twitch/eventsub/webhooks/callback')) {
			next();
		} else {
			json()(req, res, next);
		}
	});

	// ----- OR ------ //

	// You can get config service if you set the path using an env variable
	const configService = app.get(ConfigService);
	const eventSubPath = configService.get('TWITCH_EVENTSUB_PATH');

	app.use((req: Request, res: Response, next: NextFunction) => {
		if (req.path.includes(eventSubPath)) {
			next();
		} else {
			json()(req, res, next);
		}
	});

	await app.listen(3000);
}
```

## Support
