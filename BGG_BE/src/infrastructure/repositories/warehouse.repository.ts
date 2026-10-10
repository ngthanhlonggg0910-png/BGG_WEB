import { Injectable } from '@nestjs/common';
import { IWarehouseRepository } from '../../domain/repositories/warehouse.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import {
  lib_Ro_DanhSachTheoKID_MaHang,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode,
  lib_DanhSachDanhSachKho_TheoTKId,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId,
  lib_Ro_DanhSachTheoKID_MaCay_TKId,
} from '../../domain/entities/warehouse.entity.js';
import sql from 'mssql';

@Injectable()
export class WarehouseRepository implements IWarehouseRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  //Lấy danh sách kho theo TKId
  async getWarehousesByAccountId(
    TkId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId[]> {
    const pool = await this.databaseService.getPool();

    const result = await pool.request().query(`
        EXEC lib_DanhSachDanhSachKho_TheoTKId @TKId = ${TkId}
    `);

    return result.recordset;
  }

  // Tìm theo Rọ/Rổ/Palet
  async searchByMaRo(
    KID: number,
    MaHang: string,
    TKId: number,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('KID', sql.BigInt, KID)
      .input('MaHang', sql.NVarChar(50), MaHang)
      .input('TKId', sql.BigInt, TKId)
      .execute('lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId');

    return result.recordset;
  }

  //Tìm theo vị trí
  async searchByPosition(
    KID: number,
    MaViTri: string,
    TKId: number,
  ): Promise<lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('KID', sql.BigInt, KID)
      .input('MaViTri', sql.NChar(2000), MaViTri)
      .input('TKId', sql.BigInt, TKId)
      .execute('lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode');

    return result.recordset;
  }

  //Tìm theo mã hàng
  async searchByItemCode(
    KID: number,
    MaHang: string,
  ): Promise<lib_Ro_DanhSachTheoKID_MaHang[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('KID', sql.BigInt, KID)
      .input('MaHang', sql.NVarChar(100), MaHang)
      .execute('lib_Ro_DanhSachTheoKID_MaHang');

    return result.recordset;
  }

  //TÌm vật tư
  async searchMaterialLocations(
    KID: number,
    MaHang: string,
    TKId: number,
  ): Promise<lib_Ro_DanhSachTheoKID_MaCay_TKId[]> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('KID', sql.BigInt, KID)
      .input('MaHang', sql.NVarChar(100), MaHang)
      .input('TKId', sql.BigInt, TKId)
      .execute('lib_Ro_DanhSachTheoKID_MaCay_TKId');

    return result.recordset;
  }
}
