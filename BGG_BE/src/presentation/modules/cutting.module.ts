import { Module } from '@nestjs/common';
import { CuttingController } from '../controllers/cutting.controller.js';
import { CuttingRepository } from '../../infrastructure/repositories/cutting.repository.js';
import { CuttingService } from '../../application/services/cutting.service.js';

@Module({
  controllers: [CuttingController],
  providers: [
    {
      provide: 'ICuttingRepository',
      useClass: CuttingRepository,
    },
    {
      provide: 'ICuttingService',
      useClass: CuttingService,
    },
  ],
})
export class CuttingModule {}
