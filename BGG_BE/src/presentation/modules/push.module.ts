import { Module } from '@nestjs/common';
import { PushController } from '../controllers/push.controller.js';
import { PushService } from '../../application/services/push.service.js';
import { PushAuthService } from '../../application/services/push-auth.service.js';

@Module({
  controllers: [PushController],
  providers: [PushService, PushAuthService],
  exports: [PushService, PushAuthService],
})
export class PushModule {}
