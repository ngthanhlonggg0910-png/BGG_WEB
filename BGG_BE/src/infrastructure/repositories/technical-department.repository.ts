import { Injectable } from '@nestjs/common';
import { ITechnicalDepartmentRepository } from '../../domain/repositories/technical-department.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import {
  TEC_GetGiayDeNghi_ByBarcodeMau,
  TEC_GetTrangThai_ByBarCodeMau,
  TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau,
} from '../../domain/entities/technical-department.js';
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

  async layTrangThaiTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_GetTrangThai_ByBarCodeMau> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('BarcodeMau', sql.NVarChar(200), BarcodeMau)
      .execute('TEC_GetTrangThai_ByBarCodeMau');

    return result.recordset[0];
  }

  async layDanhSachFileTaiLieuTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau[]> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('BarcodeMau', sql.NVarChar(200), BarcodeMau)
      .execute('TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau');
    return result.recordset;
  }
}
