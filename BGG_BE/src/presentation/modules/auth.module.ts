import { PushModule } from './push.module.js';
import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from '../../application/services/auth.service.js';
import { AuthTokenService } from '../../application/services/auth-token.service.js';
import { UserRepository } from '../../infrastructure/repositories/user.repository.js';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthGuard } from '../guards/auth.guard.js';

@Global()
@Module({
  imports: [PushModule],
  controllers: [AuthController],

  providers: [
    AuthTokenService,
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },

    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [AuthTokenService],
})
export class AuthModule {}
