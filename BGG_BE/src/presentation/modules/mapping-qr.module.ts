import { Module } from '@nestjs/common';
import { MappingQrController } from '../controllers/mapping-qr.controller.js';
import { MappingQrRepository } from '../../infrastructure/repositories/mapping-qr.repository.js';
import { MappingQrService } from '../../application/services/mapping-qr.service.js';
import { InspectionRollQrController } from '../controllers/inspection-roll-qr.controller.js';
@Module({
  controllers: [MappingQrController, InspectionRollQrController],
  providers: [
    {
      provide: 'IMappingQrRepository',
      useClass: MappingQrRepository,
    },
    {
      provide: 'IMappingQrService',
      useClass: MappingQrService,
    },
  ],
})
export class MappingQrModule {}
