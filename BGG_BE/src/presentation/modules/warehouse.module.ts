import { Module } from '@nestjs/common';
import { WarehouseController } from '../controllers/warehouse.controller.js';
import { WarehouseService } from '../../application/services/warehouse.service.js';
import { WarehouseRepository } from '../../infrastructure/repositories/warehouse.repository.js';

@Module({
  controllers: [WarehouseController],

  providers: [
    {
      provide: 'IWarehouseService',
      useClass: WarehouseService,
    },
    {
      provide: 'IWarehouseRepository',
      useClass: WarehouseRepository,
    },
  ],
})
export class WarehouseModule {}
