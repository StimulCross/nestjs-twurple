import { Injectable } from '@nestjs/common';
import { ApiClient } from '@twurple/api';
import { InjectApiClient } from '../../../packages/api/src';

@Injectable()
export class ApiClientTestingService {
	constructor(@InjectApiClient() public readonly apiClient: ApiClient) {}
}
