import { Injectable } from '@nestjs/common';
import sql from 'mssql';
import { IFabricInspectionRepository } from '../../domain/repositories/fbabric-inspection.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import {
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi,
  QM_PhieuKiemVai_CayVai_TheoPKVId,
  QM_PhieuKiemVai_TheoTKId,
} from '../../domain/entities/fbabric-inspection.js';

@Injectable()
export class FabricInspectionRepository implements IFabricInspectionRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async loadPhieuTheoTKId(
    TKId: number,
    MaHang: string,
  ): Promise<QM_PhieuKiemVai_TheoTKId[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('TKId', sql.BigInt, TKId)
      .input('MaHang', sql.NVarChar(200), MaHang)
      .execute('QM_PhieuKiemVai_TheoTKId');

    return result.recordset;
  }

  async loadCayVaiTheoPhieuKiem(
    PKVId: number,
    MaCay: string,
  ): Promise<QM_PhieuKiemVai_CayVai_TheoPKVId[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PKVId', sql.BigInt, PKVId)
      .input('MaCay', sql.NVarChar(200), MaCay)
      .execute('QM_PhieuKiemVai_CayVai_TheoPKVId');
    return result.recordset;
  }

  async loadDanhSachLoi(
    ViTri: string,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('ViTri', sql.NVarChar(50), ViTri)
      .execute('QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi');
    return result.recordset;
  }
}
