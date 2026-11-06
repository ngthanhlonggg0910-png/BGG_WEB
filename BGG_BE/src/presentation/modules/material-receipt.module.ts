import { Module } from '@nestjs/common';
import { MaterialReceiptController } from '../controllers/material-receipt.controller.js';
import { MaterialReceiptService } from '../../application/services/material-receipt.service.js';
import { MaterialReceiptRepository } from '../../infrastructure/repositories/material-receipt.repository.js';

@Module({
  controllers: [MaterialReceiptController],
  providers: [
    {
      provide: 'IMaterialReceiptService',
      useClass: MaterialReceiptService,
    },
    {
      provide: 'IMaterialReceiptRepository',
      useClass: MaterialReceiptRepository,
    },
  ],
  exports: ['IMaterialReceiptService'],
})
export class MaterialReceiptModule {}
