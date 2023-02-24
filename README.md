# NestJS Twurple

A set of NestJS wrapper modules around awesome [@twurple](https://github.com/twurple/twurple) packages to easily and natively integrate them into your NestJS project.

Each module is a standalone package, so you can use it independently depending on your needs.

> **NOTE:** These packages require `twurple` version **6.0** or higher.

## Table of Contents

-   [Packages](#packages)
-   [General Usage](#general-usage)
    -   [Sync Module Configuration](#sync-module-configuration)
    -   [Async Module Configuration](#async-module-configuration)
    -   [Global Modules](#global-modules)

## Packages

Read the documentation for individual packages for details.

-   [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/auth) - wraps [@twurple/auth](https://github.com/twurple/twurple/tree/main/packages/auth)

-   [@nestjs-twurple/api](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/api) - wraps [@twurple/api](https://github.com/twurple/twurple/tree/main/packages/api)

-   [@nestjs-twurple/chat](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/chat) - wraps [@twurple/chat](https://github.com/twurple/twurple/tree/main/packages/chat)

-   [@nestjs-twurple/pubsub](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/pubsub) - wraps [@twurple/pubsub](https://github.com/twurple/twurple/tree/main/packages/pubsub)

-   [@nestjs-twurple/eventsub-http](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/eventsub-http) - wraps [@twurple/eventsub-http](https://github.com/twurple/twurple/tree/main/packages/eventsub-http)

-   [@nestjs-twurple/eventsub-ws](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/eventsub-ws) - wraps [@twurple/eventsub-ws](https://github.com/twurple/twurple/tree/main/packages/eventsub-ws)

## General Usage

All packages are designed to provide a [dynamic module](https://docs.nestjs.com/fundamentals/dynamic-modules) and thus must be registered either with `register` or `registerAsync` static methods.

### Sync Module Configuration

`register` static method allows you to pass options directly. This can be useful for quick tests.

```ts
import { Module } from '@nestjs/common';
import { StaticAuthProvider } from '@twurple/auth';
import { TwurpleApiModule } from '@nestjs-twurple/api';

@Module({
	imports: [
		TwurpleApiModule.register({
			isGlobal: true,
			authProvider: new StaticAuthProvider('<CLIENT_ID>', '<ACCESS_TOKEN>')
		})
	]
})
export class AppModule {}
```

### Async Module Configuration

The more flexible way to register modules is using `registerAsync` static method. This method can resolve options dynamically using one of the following factories: `useFactory`, `useExisting`, or `useClass`. The reason you should prefer `registerAsync` over `register` is that you can inject any other providers into the factory method.

#### useFactory

`useFactory` is a function that returns options. We can specify any providers that will be injected into the `useFactory` function:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '@nestjs-twurple/auth';
import { TwurpleApiModule } from '@nestjs-twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';

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
						// Handle refresh of a token.
						// You probably want to save it to persistent storage.
						//
						// You can inject a service that manages tokens here
						// in the same way as we injected the `ConfigService`.
					}
				};
			}
		}),
		TwurpleApiModule.registerAsync({
			isGlobal: true,
			// Use TWURPLE_AUTH_PROVIDER token to inject the auth provider
			// registered above
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory: (authProvider: RefreshingAuthProvider) => {
				// Here we are able to access the auth provider instance
				// from the module above
				return { authProvider };
			}
		})
	]
})
export class AppModule {}
```

In the above example, we first registered `TwurpleAuthModule` using `useFactory` function and then injected its provider (`TWURPLE_AUTH_PROVIDER`) into the `TwurpleApiModule`.

As said above, you can inject any provider to the factory function, such as a [config](https://docs.nestjs.com/techniques/configuration) service, so that you can dynamically build the options object.

#### useExisting and useClass

Another option is to use class factories in which you can also inject any providers.

> **NOTE:** Each package provides an interface that factory class must implement to provide the factory method that creates options.

So we can create a provider that creates options something like this:

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwurpleAuthOptions, TwurpleAuthOptionsFactory } from '@nestjs-twurple/auth';

@Injectable()
export class TwitchAuthOptionsFactory implements TwurpleAuthOptionsFactory {
	constructor(private readonly _configService: ConfigService) {}

	// This method must be implemented according to `TwurpleAuthOptionsFactory` interface
	createTwurpleAuthOptions(): TwurpleAuthOptions {
		return {
			type: 'refreshing',
			clientId: this._configService.get('TWITCH_CLIENT_ID'),
			clientSecret: this._configService.get('TWITCH_CLIENT_SECRET'),
			onRefresh: async (userId, token) => {
				// Handle refresh of a token.
				// You probably want to save it to persistent storage.
				//
				// You can inject a service that manages tokens here
				// in the same way as we injected the `ConfigService`.
			}
		};
	}
}
```

And the module:

```ts
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
	providers: [TwitchAuthOptionsFactory],
	exports: [TwitchAuthOptionsFactory]
})
export class TwitchAuthOptionsFactoryModule {}
```

Now we can use this factory to create options for our `TwurpleAuthModule` using either `useExisting` or `useClass` properties. `useExisting` will use the single shared instance of the factory across the entire application, while `useClass` creates a new private instance of the factory for each module.

```ts
@Module({
	imports: [
		// The options factory must be registered as well
		TwitchAuthOptionsFactoryModule,
		TwurpleAuthModule.registerAsync({
			isGlobal: true,
			useClass: TwitchAuthOptionsFactory
		})
	]
})
export class AppModule {}
```

### Global Modules

Making modules global (`isGlobal: true`) means they can be accessed from anywhere in your app no matter where they were registered. In most cases, this is desirable behavior, since you need only the single instance of auth provider, API client, chat client, etc.

But you also can create an encapsulated module that will be visible only inside the module scope where it was registered.

```ts
import { Module } from '@nestjs/common';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '@nestjs-twurple/auth';
import { TwurpleChatModule } from '@nestjs-twurple/chat';
import { StaticAuthProvider } from '@twurple/auth';

@Module({
	imports: [
		TwurpleChatModule.registerAsync({
			imports: [
				TwurpleAuthModule.register({
					type: 'static',
					clientId: '<CLIENT_ID>',
					accessToken: '<ACCESS_TOKEN>'
				})
			],
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory: (authProvider: StaticAuthProvider) => {
				return { authProvider };
			}
		})
	],
	providers: [CustomProvider],
	exports: [CustomProvider]
})
export class CustomModule {}
```

In the above example, we created `TwurpleChatModule` that can be accessed only within `CustomModule` (including its provider `CustomProvider`) where we registered it.

Note that `TwurpleAuthModule` was registered inside `TwurpleChatModule`, so it can be accessed only inside `TwurpleChatModule` internally and can't be reused for other modules.

## Tests

Available test commands: `test`, `test:verbose`, `test:cov`, `test:cov:verbose`.

```
yarn test
```

or

```
npm run test
```

In order to run EventSub HTTP E2E tests, you must set **valid** Twitch application client ID and client secret in `./tests/constants.ts` and install [twitch-cli](https://github.com/twitchdev/twitch-cli) to your system. Also, E2E tests use experimental [fetch](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch) API, so make sure you have installed NodeJS version 18 or higher. Otherwise, E2E tests will be skipped.

### Coverage

`test:cov` script output:

```
PASS eventsub-http tests/eventsub-http/twurple-eventsub-http.e2e.spec.ts (15.059 s)
PASS chat tests/chat/twurple-chat.module.spec.ts
PASS api tests/api/twurple-api.module.spec.ts
PASS eventsub-ws tests/eventsub-ws/twurple-eventsub-ws.module.spec.ts
PASS auth tests/auth/twurple-auth.module.spec.ts
PASS pubsub tests/pubsub/twurple-pubsub.module.spec.ts
PASS eventsub-http tests/eventsub-http/twurple-eventsub-http.module.spec.ts

---------------------------------------------|---------|----------|---------|---------|-------------------
File                                         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------------------------------|---------|----------|---------|---------|-------------------
All files                                    |     100 |      100 |     100 |     100 |
 api/src                                     |     100 |      100 |     100 |     100 |
  twurple-api.module.ts                      |     100 |      100 |     100 |     100 |
 api/src/decorators                          |     100 |      100 |     100 |     100 |
  inject-api-client.decorator.ts             |     100 |      100 |     100 |     100 |
 auth/src                                    |     100 |      100 |     100 |     100 |
  twurple-auth.module.ts                     |     100 |      100 |     100 |     100 |
 auth/src/decorators                         |     100 |      100 |     100 |     100 |
  inject-auth-provider.decorator.ts          |     100 |      100 |     100 |     100 |
 chat/src                                    |     100 |      100 |     100 |     100 |
  twurple-chat.module.ts                     |     100 |      100 |     100 |     100 |
 chat/src/decorators                         |     100 |      100 |     100 |     100 |
  inject-chat-client.decorator.ts            |     100 |      100 |     100 |     100 |
 eventsub-http/src                           |     100 |      100 |     100 |     100 |
  twurple-eventsub-http.module.ts            |     100 |      100 |     100 |     100 |
 eventsub-http/src/decorators                |     100 |      100 |     100 |     100 |
  inject-eventsub-http-listener.decorator.ts |     100 |      100 |     100 |     100 |
 eventsub-ws/src                             |     100 |      100 |     100 |     100 |
  twurple-eventsub-ws.module.ts              |     100 |      100 |     100 |     100 |
 eventsub-ws/src/decorators                  |     100 |      100 |     100 |     100 |
  inject-eventsub-ws-listener.decorator.ts   |     100 |      100 |     100 |     100 |
 pubsub/src                                  |     100 |      100 |     100 |     100 |
  twurple-pubsub.module.ts                   |     100 |      100 |     100 |     100 |
 pubsub/src/decorators                       |     100 |      100 |     100 |     100 |
  inject-pubsub-client.decorator.ts          |     100 |      100 |     100 |     100 |
---------------------------------------------|---------|----------|---------|---------|-------------------

Test Suites: 7 passed, 7 total
Tests:       78 passed, 78 total
Snapshots:   0 total
Time:        26.716 s, estimated 27 s
Ran all test suites in 6 projects.
Done in 27.98s.

```

## Support
