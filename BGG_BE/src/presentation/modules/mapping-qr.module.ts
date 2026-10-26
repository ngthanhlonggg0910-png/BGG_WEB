import { Module } from '@nestjs/common';
import { MappingQrController } from '../controllers/mapping-qr.controller.js';
import { MappingQrRepository } from '../../infrastructure/repositories/mapping-qr.repository.js';
import { MappingQrService } from '../../application/services/mapping-qr.service.js';
@Module({
  controllers: [MappingQrController],
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
