# NestJS Twurple API

A NestJS wrapper for [@twurple/api](https://github.com/twurple/twurple/tree/main/packages/api) package.

This module can be used alone or in combination with other [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple) modules.

> [!IMPORTANT]
> These packages require `twurple` version **7.0** or higher.

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
    -   [Import and Registration](#import-and-registration)
    -   [Using the ApiClient](#using-the-apiclient)

## Installation

This module can be used in combination with [@nestjs-twurple/auth](https://github.com/stimulcross/nestjs-twurple/tree/main/packages/auth) module. Install it if necessary.

**yarn:**

```
yarn add @nestjs-twurple/api @twurple/auth @twurple/api
```

**npm:**

```
npm i @nestjs-twurple/api @twurple/auth @twurple/api
```

## Usage

_For basic information, check out the general documentation at the root of the repository [@nestjs-twurple](https://github.com/stimulcross/nestjs-twurple)._

_Also take a look at the official `@twurple/api` [reference](https://twurple.js.org/reference/api) and guides: [Calling the Twitch API](https://twurple.js.org/docs/getting-data/api/calling-api.html)._

### Import and Registration

The module must be register either with [register](https://github.com/stimulcross/nestjs-twurple#sync-module-configuration) or [registerAsync](https://github.com/stimulcross/nestjs-twurple#async-module-configuration) static methods.

To create an API client, you must provide `TwurpleApiOptions`. The options below extended from the [ApiConfig](https://twurple.js.org/reference/api/interfaces/ApiConfig.html) interface provided by `@twurple/api` package, so the example below may become outdated at some point.

```ts
interface TwurpleApiIptions {
	authProvider: AuthProvider;
	fetchOptions?: TwitchApiCallFetchOptions;
	logger?: Partial<LoggerOptions>;
}
```

Example of using `register` method:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshingAuthProvider } from '@twurple/auth';
import { TwurpleApiModule } from '@nestjs-twurple/api';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TwurpleApiModule.register({
			isGlobal: true,
			authProvider: new RefreshingAuthProvider({
				// ...
			})
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
import { TwurpleApiModule } from '@nestjs-twurple/api';
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
		TwurpleApiModule.registerAsync({
			isGlobal: true,
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory: (authProvider: AuthProvider) => {
				// Here we are able to access the auth provider instance
				// provided by TwurpleAuthModule
				return { authProvider };
			}
		})
	]
})
export class AppModule {}
```

### Using the ApiClient

The module internally creates an [ApiClient](https://twurple.js.org/reference/api/classes/ApiClient.html) instance. You can inject it anywhere you need it using `@InjectApiClient()` decorator:

```ts
import { Injectable } from '@nestjs/common';
import { InjectApiClient } from '@nestjs-twurple/api';
import { ApiClient } from '@twurple/api';

@Injectable()
export class CustomProvider {
	constructor(@InjectApiClient() private readonly _apiClient: ApiClient) {}
}
```

Alternatively, you can use `TWURPLE_API_CLIENT` token to inject the `ApiClient` instance:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { TWURPLE_API_CLIENT } from '@nestjs-twurple/api';
import { ApiClient } from '@twurple/api';

@Injectable()
export class CustomProvider {
	constructor(@Inject(TWURPLE_API_CLIENT) private readonly _apiClient: ApiClient) {}
}
```
