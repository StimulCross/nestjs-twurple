/* eslint-disable node/no-process-env */
import { exec, execSync } from 'child_process';
import * as path from 'path';
import { type INestApplication } from '@nestjs/common';
import { type AbstractHttpAdapter } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { type ApiClient } from '@twurple/api';
import { type AuthProvider } from '@twurple/auth';
import { type EventSubMiddleware } from '@twurple/eventsub-http';
import { config } from 'dotenv';
import * as ngrok from 'ngrok';
import { EventsubHttpTestingService } from './mock/eventsub-http-testing-service';
import { TWURPLE_API_CLIENT, TwurpleApiModule } from '../../packages/api/src';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '../../packages/auth/src';
import { TwurpleEventSubHttpModule } from '../../packages/eventsub-http/src';
import { MOCK_USER_ID, PORT, SECRET } from '../constants';

config();

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const ngrokAuthToken = process.env.NGROK_AUTH_TOKEN;

const describeIf = (cond: () => boolean): Function => (cond() ? describe : describe.skip);

const TWITCH_EVENTSUB_PATH = 'twitch/eventsub/webhooks/callback';
const TEST_TIMEOUT = 60_000;

const runCommand = async (cmd: string): Promise<string> =>
	await new Promise((resolve, reject) => {
		exec(cmd, (error, stdout) => {
			if (error) {
				return reject(error);
			}

			return resolve(stdout.toString());
		});
	});

const validateConfig = (): boolean => {
	const version: number[] = process.versions.node.split('.').map(ver => parseInt(ver, 10));

	if (version[0] < 18) {
		console.warn('E2E tests use fetch API and require NodeJS version 18 or higher');
		return false;
	}

	if (!clientId || !clientSecret) {
		console.warn('You must set valid Twitch app credentials to run EventSub HTTP E2E tests');
		return false;
	}

	if (!ngrokAuthToken) {
		console.warn('You must set valid ngrok auth token to run EventSub HTTP E2E tests');
		return false;
	}

	try {
		execSync('twitch version', { encoding: 'utf8' });
	} catch (e) {
		console.warn('You must install Twitch CLI tool to run EventSub HTTP E2E tests');
		return false;
	}

	return true;
};

const createApp = async (
	hostName: string,
	adapter: AbstractHttpAdapter,
	applyHandlers: boolean = true
): Promise<INestApplication> => {
	const TestingModule = await Test.createTestingModule({
		imports: [
			TwurpleAuthModule.register({
				isGlobal: true,
				type: 'refreshing',
				clientId: clientId!,
				clientSecret: clientSecret!
			}),
			TwurpleApiModule.registerAsync({
				isGlobal: true,
				inject: [TWURPLE_AUTH_PROVIDER],
				useFactory: (authProvider: AuthProvider) => {
					return { authProvider };
				}
			}),
			TwurpleEventSubHttpModule.registerAsync({
				inject: [TWURPLE_API_CLIENT],
				useFactory: (apiClient: ApiClient) => {
					return {
						applyHandlersOnModuleInit: applyHandlers,
						apiClient,
						legacySecrets: false,
						secret: SECRET,
						hostName,
						pathPrefix: 'twitch/eventsub/webhooks/callback'
					};
				}
			})
		],
		providers: [EventsubHttpTestingService]
	}).compile();

	const app = TestingModule.createNestApplication(adapter, { bodyParser: false });
	await app.init();
	return app;
};

const testHandler = async (eventsubHttpListener: EventSubMiddleware): Promise<void> => {
	const handler = jest.fn();
	const subscription = eventsubHttpListener.onStreamOnline(MOCK_USER_ID, handler);
	const cmdArgs = (await subscription.getCliTestCommand()).split(' ');
	cmdArgs.push('-t');
	cmdArgs.push(MOCK_USER_ID);

	await runCommand(cmdArgs.join(' '));

	expect(handler).toBeCalled();
	expect(handler).toBeCalledWith(expect.objectContaining({ broadcasterId: MOCK_USER_ID }));
};

describeIf(validateConfig)('Twurple EventSub HTTP E2E test suite', () => {
	let ngrokUrl: string;
	let hostName: string;

	beforeAll(async () => {
		ngrokUrl = await ngrok.connect({ addr: PORT, authtoken: ngrokAuthToken });
		hostName = new URL(ngrokUrl).hostname;
	}, TEST_TIMEOUT);

	afterAll(async () => {
		await ngrok.disconnect();
		await ngrok.kill();
	});

	describe('Express platform', () => {
		let app: INestApplication | undefined;
		let eventSubHttpTestingService: EventsubHttpTestingService;

		afterEach(async () => {
			await app!.close();
			app = undefined;
		});

		test(
			'should automatically apply handlers',
			async () => {
				app = await createApp(hostName, new ExpressAdapter());
				await app.listen(PORT);

				eventSubHttpTestingService = app.get(EventsubHttpTestingService);
				await eventSubHttpTestingService.eventSubHttpListener.markAsReady();

				const response = await fetch(path.join(ngrokUrl, TWITCH_EVENTSUB_PATH));
				expect(response.status).toBe(200);
			},
			TEST_TIMEOUT
		);

		test(
			'should not automatically apply handlers if `applyHandlersOnModuleInit` set to `false`',
			async () => {
				app = await createApp(hostName, new ExpressAdapter(), false);
				await app.listen(PORT);

				eventSubHttpTestingService = app.get(EventsubHttpTestingService);
				await eventSubHttpTestingService.eventSubHttpListener.markAsReady();

				const response = await fetch(path.join(ngrokUrl, TWITCH_EVENTSUB_PATH));
				expect(response.status).toBe(404);
			},
			TEST_TIMEOUT
		);

		test(
			'should handle events',
			async () => {
				app = await createApp(hostName, new ExpressAdapter());
				await app.listen(PORT);

				eventSubHttpTestingService = app.get(EventsubHttpTestingService);
				await eventSubHttpTestingService.eventSubHttpListener.markAsReady();

				await testHandler(eventSubHttpTestingService.eventSubHttpListener);
			},
			TEST_TIMEOUT
		);
	});

	describe('Fastify platform', () => {
		test('should throw error on module init', async () => {
			const fn = async (): Promise<void> => {
				await createApp(hostName, new FastifyAdapter());
			};

			await expect(fn).rejects.toThrow();
		});
	});
});
