import sql from 'mssql';
import { Injectable } from '@nestjs/common';
import { MaterialLocation } from '../../domain/entities/MaterialToBasket.js';
import { IMaterialLocationRepository } from '../../domain/repositories/MaterialToBasket.interface.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class MaterialLocationRepository implements IMaterialLocationRepository {
  constructor(public readonly databaseService: DatabaseService) {}

  async updateNPL(
    maRo: string,
    maNPL: string,
    nguoiCapNhat: string,
  ): Promise<MaterialLocation> {
    const pool = await this.databaseService.getPool();

    const updateResult = await pool
      .request()
      .input('MaRo', sql.NVarChar(50), maRo)
      .input('MaCay', sql.NVarChar(50), maNPL)
      .input('NguoiCapNhat', sql.NVarChar(500), nguoiCapNhat)
      .execute('lib_NPL_CapNhatViTri_New');

    const ketQua = updateResult.recordset[0]?.KetQua;

    if (ketQua !== 1) {
      return {
        KetQua: ketQua,
      };
    }

    // 2. Update thành công -> lấy thông tin rọ
    const infoResult = await pool
      .request()
      .input('MaRo', sql.NVarChar(50), maRo).query(`
        SELECT
            R.MaRo,
            dbo.LAY_TENVITRI(R.VTId) AS TenViTri,
            (
            SELECT COUNT(*)
            FROM WH_ChiTietPhieuGiamDinh_Cay C
            WHERE C.MaRo = R.MaRo
            ) AS SLTrongRo,
            CONVERT(VARCHAR(8), GETDATE(), 108) AS Time
      FROM Lib_RO R
      WHERE R.MaRo = @MaRo
    `);

    return {
      KetQua: ketQua,
      MaNPL: maNPL,
      ...infoResult.recordset[0],
    };
  }
}
