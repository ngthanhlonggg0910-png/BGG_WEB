import { Global, Module } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service.js';
import { DatabaseController } from '../../presentation/controllers/database.controller.js';

@Global()
@Module({
  controllers: [DatabaseController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
