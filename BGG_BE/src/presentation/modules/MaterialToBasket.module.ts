import { Module } from '@nestjs/common';
import { MaterialLocationController } from '../controllers/MaterialToBasket.controller.js';
import { MaterialLocationRepository } from '../../infrastructure/repositories/MaterialToBasket.js';
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
