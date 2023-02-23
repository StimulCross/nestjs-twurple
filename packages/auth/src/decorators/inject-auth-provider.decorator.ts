import { Inject } from '@nestjs/common';
import { TWURPLE_AUTH_PROVIDER } from '../constants';

/**
 * Injects the authentication provider instance.
 *
 * One of the following providers will be injected depending on `TwurpleAuthModule` config: `StaticAuthProvider`,
 * `RefreshingAuthProvider`, or `AppTokenAuthProvider`.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class CustomProvider {
 *     constructor(@InjectAuthProvider() private readonly _authProvider: RefreshingAuthProvider) {}
 * }
 * ```
 */
export const InjectAuthProvider = (): ParameterDecorator => Inject(TWURPLE_AUTH_PROVIDER);
