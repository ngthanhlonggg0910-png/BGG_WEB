import { Module } from '@nestjs/common';
import { MaterialLocationController } from '../controllers/updateNPL.controller.js';
import { MaterialLocationRepository } from '../../infrastructure/repositories/updateNPL.repository.js';
import { MaterialLocationService } from '../../application/services/marteriallocation.service.js';
@Module({
  controllers: [MaterialLocationController],
  providers: [
    {
      provide: 'IMaterialLocationRepository',
      useClass: MaterialLocationRepository,
    },
    {
      provide: 'IMaterialLocationService',
      useClass: MaterialLocationService,
    },
  ],
})
export class MaterialLocationModule {}
