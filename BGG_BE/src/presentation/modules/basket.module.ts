import { Module } from '@nestjs/common';
import { BasketLocationController } from '../controllers/basket.controller.js';
import { BasketLocationRepository } from '../../infrastructure/repositories/basket.js';
import { BasketLocationService } from '../../application/services/basket.service.js';

@Module({
  controllers: [BasketLocationController],
  providers: [
    {
      provide: 'IBasketLocationRepository',
      useClass: BasketLocationRepository,
    },
    {
      provide: 'IBasketLocationService',
      useClass: BasketLocationService,
    },
  ],
})
export class BasketLocationModule {}
