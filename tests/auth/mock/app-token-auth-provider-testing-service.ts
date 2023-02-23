import { Injectable } from '@nestjs/common';
import { AppTokenAuthProvider } from '@twurple/auth';
import { InjectAuthProvider } from '../../../packages/auth/src';

@Injectable()
export class AppTokenAuthProviderTestingService {
	constructor(@InjectAuthProvider() public readonly authProvider: AppTokenAuthProvider) {}
}
