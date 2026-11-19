import { Module } from '@nestjs/common';
import { TechnicalDepartmentController } from '../controllers/technical-department.controller.js';
import { TechnicalDepartmentRepository } from '../../infrastructure/repositories/technical-department.repository.js';
import { TechnicalDepartmentService } from '../../application/services/technical-department.service.js';

@Module({
  controllers: [TechnicalDepartmentController],
  providers: [
    {
      provide: 'ITechnicalDepartmentRepository',
      useClass: TechnicalDepartmentRepository,
    },
    {
      provide: 'ITechnicalDepartmentService',
      useClass: TechnicalDepartmentService,
    },
  ],
})
export class TechnicalDepartmentModule {}
