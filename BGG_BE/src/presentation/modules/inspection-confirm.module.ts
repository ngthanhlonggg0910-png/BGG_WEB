import { Module } from '@nestjs/common';

import { InspectionConfirmService } from '../../application/services/inspection-confirm.service.js';
import { InspectionConfirmRepository } from '../../infrastructure/repositories/inspection-confirm.repository.js';
import { InspectionConfirmController } from '../controllers/inspection-confirm.controller.js';

@Module({
  controllers: [InspectionConfirmController],
  providers: [InspectionConfirmService, InspectionConfirmRepository],
})
export class InspectionConfirmModule {}
