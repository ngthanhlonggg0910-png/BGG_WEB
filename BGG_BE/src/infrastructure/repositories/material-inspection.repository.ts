import { Injectable } from '@nestjs/common';
import sql from 'mssql';
import type {
  MaterialAccessoryDefect,
  MaterialInspectionAccessoryDefect,
} from '../../domain/entities/material-inspection.entity.js';
import type { IMaterialInspectionRepository } from '../../domain/repositories/material-inspection.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class MaterialInspectionRepository implements IMaterialInspectionRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAccessoryDefects(): Promise<MaterialAccessoryDefect[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool.request().query(`
      SELECT MaLoi, TenLoi
      FROM lib_DSLoi_PhuLieu
    `);

    return result.recordset;
  }

  async getDeclaredAccessoryDefects(): Promise<
    MaterialInspectionAccessoryDefect[]
  > {
    const pool = await this.databaseService.getPool();
    const result = await pool.request().query(`
      SELECT
        b.Id,
        b.CTPGDId,
        a.MaLoi,
        a.TenLoi,
        b.SoLuongLoi,
        b.TenNguoiTao,
        b.ThoiGian
      FROM Lib_DSLoi_PhuLieu a
      JOIN WH_ChiTietPhieuGiamDinh_KiemPhuLieu b ON a.MaLoi = b.MaLoi
    `);

    return result.recordset;
  }

  async deleteDeclaredAccessoryDefect(id: number): Promise<number> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('Id', sql.BigInt, id)
      .query(`
        DELETE FROM WH_ChiTietPhieuGiamDinh_KiemPhuLieu
        WHERE Id = @Id
      `);

    return result.rowsAffected[0] ?? 0;
  }

  async updateInspectionRate(
    tiLe: number,
    loaiTiLe: string,
    ctpGdId: number,
  ): Promise<void> {
    const pool = await this.databaseService.getPool();
    await pool
      .request()
      .input('TiLe', sql.Float, tiLe)
      .input('LoaiTiLe', sql.NVarChar(250), loaiTiLe)
      .input('CTPGDId', sql.BigInt, ctpGdId)
      .execute('wh_chitietphieugiamdinh_capnhat_tilekiem');
  }

  async updateHuongXuLy(
    Option: string,
    CTPGDId: number,
  ): Promise<{ KetQua: number }> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('Option', sql.NVarChar(200), Option)
      .input('CTPGDId', sql.BigInt, CTPGDId)
      .output('KetQua', sql.Int)
      .execute('wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile');

    return {
      KetQua: result.output.KetQua,
    };
  }

  async updateTrangThai(
    PGDId: number,
    TrangThai: string,
    NoiDung: string,
    NguoiThayDoi: string,
    TaiKhoanThayDoi: string,
    MacAddress: string,
    ComputerName: string,
  ): Promise<{ KetQua: number }> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PGDId', sql.BigInt, PGDId)
      .input('TrangThai', sql.NVarChar(200), TrangThai)
      .input('NoiDung', sql.NVarChar(200), NoiDung)
      .input('NguoiThayDoi', sql.NVarChar(200), NguoiThayDoi)
      .input('TaiKhoanThayDoi', sql.NVarChar(200), TaiKhoanThayDoi)
      .input('MACAddress', sql.NVarChar(200), MacAddress)
      .input('ComputerName', sql.NVarChar(200), ComputerName)
      .execute('wh_PhieuGiamDinh_CapNhatTrangThai');

    return {
      KetQua: result.recordset?.[0]?.KetQua ?? 0,
    };
  }

  async khaiBaoLoiPhuLieu(
    CTPGDId: number,
    MaLoi: string,
    SoLuongLoi: number,
    TenNguoiTao: string,
  ): Promise<{ KetQua: number }> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('CTPGDId', sql.BigInt, CTPGDId)
      .input('MaLoi', sql.NVarChar(200), MaLoi)
      .input('SoLuongLoi', sql.Float, SoLuongLoi)
      .input('TenNguoiTao', sql.NVarChar(200), TenNguoiTao)
      .output('KetQua', sql.Int)
      .execute('wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile');

    return {
      KetQua: result.output.KetQua,
    };
  }
}
