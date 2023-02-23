import { Inject } from '@nestjs/common';
import { TWURPLE_API_CLIENT } from '../constants';

/**
 * Injects `ApiClient` instance imported from `@twurple/api`.
 *
 * @example
 * import { ApiClient } from '@twurple/api';
 *
 * ```ts
 * @Injectable()
 * export class CustomProvider {
 *     constructor(@InjectApiClient() private readonly _apiClient: ApiClient) {}
 * }
 * ```
 */
export const InjectApiClient = (): ParameterDecorator => Inject(TWURPLE_API_CLIENT);
