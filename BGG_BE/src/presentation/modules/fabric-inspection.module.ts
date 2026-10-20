import { Module } from '@nestjs/common';
import { FabricInspectionController } from '../controllers/fabric-inspection.controller.js';
import { FabricInspectionService } from '../../application/services/fabric-inspection.service.js';
import { FabricInspectionRepository } from '../../infrastructure/repositories/fabric-inspection.repository.js';

@Module({
  controllers: [FabricInspectionController],
  providers: [
    {
      provide: 'IFabricInspectionService',
      useClass: FabricInspectionService,
    },
    {
      provide: 'IFabricInspectionRepository',
      useClass: FabricInspectionRepository,
    },
  ],
})
export class FabricInspectionModule {}
