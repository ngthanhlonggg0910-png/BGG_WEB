import { Injectable } from '@nestjs/common';
import { IWarehouseRepository } from '../../domain/repositories/warehouse.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import {
  lib_Ro_DanhSachTheoKID_MaHang,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode,
  lib_DanhSachDanhSachKho_TheoTKId,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId,
  lib_Ro_DanhSachTheoKID_MaCay_TKId,
  BasketLocation,
  RIdAndMaRo,
  BasketFabricRoll,
  BasketFabricRollDetail,
} from '../../domain/entities/warehouse.entity.js';
import sql from 'mssql';

@Injectable()
export class WarehouseRepository implements IWarehouseRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  //Lấy danh sách kho theo TKId
  async getDanhSachKhoTheoTKId(
    TkId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId[]> {
    const pool = await this.databaseService.getPool();

    const result = await pool.request().query(`
        EXEC lib_DanhSachDanhSachKho_TheoTKId @TKId = ${TkId}
    `);

    return result.recordset;
  }

  // Tìm theo Rọ/Rổ/Palet
  async timTheoMaRo(
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
  async timTheoViTri(
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
  async timTheoMaHang(
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
  async timTheoVatTu(
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

  async updateBasketLocation(
    maRo: string,
    maViTri: string,
    nguoiCapNhat: string,
  ): Promise<BasketLocation> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('MaRo', sql.NVarChar(100), maRo)
      .input('MaViTri', sql.NVarChar(2000), maViTri)
      .input('NguoiCapNhat', sql.NVarChar(100), nguoiCapNhat)
      .execute('lib_Ro_CapNhatViTri_New');

    return result.recordset[0] as BasketLocation;
  }

  async layDanhSachRoTheoKho(KID: number, VTId: string): Promise<RIdAndMaRo[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('KId', sql.BigInt, KID)
      .input('VTId', sql.NVarChar(50), VTId)
      .execute('dbo.Lib_RO_TimTheoKho_ViTri');

    return result.recordset;
  }

  async layDanhSachCayVaiTrongRo(
    KID: number,
    MaRo: string,
    TKId: number,
  ): Promise<BasketFabricRoll[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('KID', sql.BigInt, KID)
      .input('MaRo', sql.NVarChar(100), MaRo)
      .input('TKId', sql.BigInt, TKId)
      .execute('lib_Ro_DanhSachCayTheoKID_MaRo_TKId');

    return result.recordset;
  }

  async layDanhSachCayVaiTheoDieuKien(
    KID: number,
    MaRo: string,
    Item: string,
    Art: string,
    Lot: string,
    Mau: string,
    TKId: number,
  ): Promise<BasketFabricRollDetail[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('KID', sql.BigInt, KID)
      .input('MaHang', sql.NVarChar(500), MaRo)
      .input('Item', sql.NVarChar(500), Item)
      .input('Art', sql.NVarChar(500), Art ?? '')
      .input('Lot', sql.NVarChar(500), Lot ?? '')
      .input('Mau', sql.NVarChar(500), Mau ?? '')
      .input('TKId', sql.BigInt, TKId)
      .execute('dbo.lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId');

    return result.recordset;
  }
}
