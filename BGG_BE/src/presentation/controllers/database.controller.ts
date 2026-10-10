import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service.js';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('test')
  async testConnection() {
    return await this.databaseService.testConnection();
  }
}
