import { Module } from '@nestjs/common';
import { MaterialInspectionService } from '../../application/services/material-inspection.service.js';
import { MaterialInspectionRepository } from '../../infrastructure/repositories/material-inspection.repository.js';
import { MaterialInspectionController } from '../controllers/material-inspection.controller.js';

@Module({
  controllers: [MaterialInspectionController],
  providers: [
    {
      provide: 'IMaterialInspectionRepository',
      useClass: MaterialInspectionRepository,
    },
    {
      provide: 'IMaterialInspectionService',
      useClass: MaterialInspectionService,
    },
  ],
})
export class MaterialInspectionModule {}
