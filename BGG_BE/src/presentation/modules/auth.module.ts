import { Module } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service.js';
import { UserRepository } from '../../infrastructure/repositories/user.repository.js';
import { AuthController } from '../controllers/auth.controller.js';

@Module({
  controllers: [AuthController],

  providers: [
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },

    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
})
export class AuthModule {}
