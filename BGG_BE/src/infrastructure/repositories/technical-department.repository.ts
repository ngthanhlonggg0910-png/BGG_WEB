import { Injectable } from '@nestjs/common';
import { ITechnicalDepartmentRepository } from '../../domain/repositories/technical-department.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import { TEC_GetGiayDeNghi_ByBarcodeMau } from '../../domain/entities/technical-department.js';
import sql from 'mssql';
@Injectable()
export class TechnicalDepartmentRepository implements ITechnicalDepartmentRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async layThongTinGiayDeNghiTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_GetGiayDeNghi_ByBarcodeMau> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('BarcodeMau', sql.NVarChar(200), BarcodeMau)
      .execute('TEC_GetGiayDeNghi_ByBarcodeMau');

    return result.recordset[0];
  }
}
