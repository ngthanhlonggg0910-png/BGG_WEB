import { Module } from '@nestjs/common';
import { PickingOrderController } from '../controllers/picking-order.controller.js';
import { PickingOrderService } from '../../application/services/picking-order.service.js';
import { PickingOrderRepository } from '../../infrastructure/repositories/picking-order.repository.js';

@Module({
  controllers: [PickingOrderController],
  providers: [
    {
      provide: 'IPickingOrderService',
      useClass: PickingOrderService,
    },
    {
      provide: 'IPickingOrderRepository',
      useClass: PickingOrderRepository,
    },
  ],
})
export class PickingOrderModule {}
