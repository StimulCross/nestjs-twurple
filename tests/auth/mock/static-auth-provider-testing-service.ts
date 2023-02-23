import { Injectable } from '@nestjs/common';
import { StaticAuthProvider } from '@twurple/auth';
import { InjectAuthProvider } from '../../../packages/auth/src';

@Injectable()
export class StaticAuthProviderTestingService {
	constructor(@InjectAuthProvider() public readonly authProvider: StaticAuthProvider) {}
}
