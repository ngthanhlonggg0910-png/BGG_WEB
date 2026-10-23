import { Module } from '@nestjs/common';
import { ProductionOrderController } from '../controllers/production-order.controller.js';
import { ProductionOrderService } from '../../application/services/production-order.service.js';
import { ProductionOrderRepository } from '../../infrastructure/repositories/production-order.repository.js';

@Module({
  controllers: [ProductionOrderController],
  providers: [
    {
      provide: 'IProductionOrderService',
      useClass: ProductionOrderService,
    },
    {
      provide: 'IProductionOrderRepository',
      useClass: ProductionOrderRepository,
    },
  ],
})
export class ProductionOrderModule {}
