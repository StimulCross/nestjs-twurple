import { Injectable } from '@nestjs/common';
import { RefreshingAuthProvider } from '@twurple/auth';
import { InjectAuthProvider } from '../../../packages/auth/src';

@Injectable()
export class RefreshingAuthProviderTestingService {
	constructor(@InjectAuthProvider() public readonly authProvider: RefreshingAuthProvider) {}
}
