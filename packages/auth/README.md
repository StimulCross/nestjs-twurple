# NestJS Twurple Auth

A NestJS wrapper for [@twurple/auth](https://github.com/twurple/twurple/tree/main/packages/auth) package.

This module can be used alone or in combination with other [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple) modules.

> [!IMPORTANT]
> These packages require `twurple` version **7.0** or higher.

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
    -   [Import and Registration](#import-and-registration)
    -   [Using the AuthProvider](#using-the-authprovider)
    -   [Extended Usage](#extended-usage)
-   [Support](#support)

## Installation

**yarn:**

```
yarn add @nestjs-twurple/auth @twurple/auth
```

**npm:**

```
npm i @nestjs-twurple/auth @twurple/auth
```

## Usage

_For basic information, check out the general documentation at the root of the repository [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple)._

_Also take a look at official `@twurple/auth` API [reference](https://twurple.js.org/reference/auth) and [guides](https://twurple.js.org/docs/auth)._

### Import and Registration

The module must be register either with [register](https://github.com/stimulcross/nestjs-twurple#sync-module-configuration) or [registerAsync](https://github.com/stimulcross/nestjs-twurple#async-module-configuration) static methods. It supports [StaticAuthProvider](https://twurple.js.org/reference/auth/classes/StaticAuthProvider.html), [RefreshingAuthProvider](https://twurple.js.org/reference/auth/classes/RefreshingAuthProvider.html), and [AppTokenAuthProvider](https://twurple.js.org/reference/auth/classes/AppTokenAuthProvider.html) from `@twurple/auth` package.

To create an app token auth provider, you must provide `TwurpleAuthAppTokenProviderOptions`:

```ts
interface TwurpleAuthAppTokenProviderOptions {
	type: 'app';
	clientId: string;
	clientSecret: string;
	impliedScopes?: string[];
}
```

To create a static auth provider, you must provide `TwurpleAuthStaticProviderOptions`:

```ts
interface TwurpleAuthStaticProviderOptions {
	type: 'static';
	clientId: string;
	accessToken: string | AccessToken;
	scopes?: string[];
}
```

To create a refreshing auth provider, you must provide `TwurpleAuthRefreshingProviderOptions`.

```ts
interface TwurpleAuthRefreshingProviderOptions {
	type: 'refreshing';
	clientId: string;
	clientSecret: string;
	redirectUri?: string;
	appImpliedScopes?: string[];
}
```

Static auth provider example using the `register` method:

```ts
import { Module } from '@nestjs/common';
import { TwurpleAuthModule } from '@nestjs-twurple/auth';

@Module({
	imports: [
		TwurpleAuthModule.register({
			isGlobal: true,
			type: 'static',
			clientId: '<CLIENT_ID>',
			accessToken: '<ACCESS_TOKEN>'
		})
	]
})
export class AppModule {}
```

Refreshing auth provider example using the `registerAsync` method:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwurpleAuthModule } from '@nestjs-twurple/auth';

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
						// Handle refresh of a token.
						// You probably want to save it to persistent storage.
						//
						// You can inject a service that manages tokens here
						// in the same way as we injected the `ConfigService`.
					}
				};
			}
		})
	]
})
export class AppModule {}
```

App auth provider example using the `registerAsync` method:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwurpleAuthModule } from '@nestjs-twurple/auth';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TwurpleAuthModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					type: 'app',
					clientId: configService.get('TWITCH_CLIENT_ID'),
					clientSecret: configService.get('TWITCH_CLIENT_SECRET')
				};
			}
		})
	]
})
export class AppModule {}
```

### Using the AuthProvider

The module internally creates an `AuthProvider` instance ([StaticAuthProvider](https://twurple.js.org/reference/auth/classes/StaticAuthProvider.html), [RefreshingAuthProvider](https://twurple.js.org/reference/auth/classes/RefreshingAuthProvider.html), or [AppTokenAuthProvider](https://twurple.js.org/reference/auth/classes/AppTokenAuthProvider.html) depending on the provided options.) You can inject the auth provider instance anywhere you need it using `@InjectAuthProvider()` decorator:

```ts
import { Injectable } from '@nestjs/common';
import { InjectAuthProvider } from '@nestjs-twurple/auth';
import { AuthProvider } from '@twurple/auth';

@Injectable()
export class CustomProvider {
	constructor(@InjectAuthProvider() private readonly _authProvider: AuthProvider) {}
}
```

`AuthProvider` is a generic interface. You can specify the correct auth provider type depending on your `TwurpleAuthModule` config: `AppTokenAuthProvider`, `StaticAuthProvider`, or `RefreshingAuthProvider`.

Alternatively, you can use the `TWURPLE_AUTH_PROVIDER` token to inject the auth provider instance:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { TWURPLE_AUTH_PROVIDER } from '@nestjs-twurple/auth';
import { AuthProvider } from '@twurple/auth';

@Injectable()
export class CustomProvider {
	constructor(@Inject(TWURPLE_AUTH_PROVIDER) private readonly _authProvider: AuthProvider) {}
}
```

### Extended Usage

Some other `twurple` modules such as [@nestjs-twurple/api](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/api) and [@nestjs-twurple/chat](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/chat) require `AuthProvider` to work. You can use `TwurpleAuthModule` module to share the same auth provider instance across all modules:

```ts
import { Module } from '@nestjs/common';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '@nestjs-twurple/auth';
import { TwurpleApiModule } from '@nestjs-twurple/api';
import { TwurpleChatModule } from '@nestjs-twurple/chat';
import { AuthProvider } from '@twurple/auth';

@Module({
	imports: [
		TwurpleAuthModule.registerAsync({
			isGlobal: true // Must be true to make it reusable
			//... Other configuration
		}),
		TwurpleApiModule.registerAsync({
			isGlobal: true,
			// Inject auth provider to the factory method
			// using TWURPLE_AUTH_PROVIDER token
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory: (authProvider: AuthProvider) => {
				return { authProvider };
			}
		}),
		TwurpleChatModule.registerAsync({
			isGlobal: true,
			// Inject auth provider to the factory method
			// using TWURPLE_AUTH_PROVIDER token
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory: (authProvider: AuthProvider) => {
				return { authProvider };
			}
		})
	]
})
export class AppModule {}
```

## Support
