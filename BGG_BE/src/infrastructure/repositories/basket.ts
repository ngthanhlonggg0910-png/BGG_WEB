import { Injectable } from '@nestjs/common';
import { IBasketLocationRepository } from '../../domain/repositories/basket.interface.js';
import { DatabaseService } from '../database/database.service.js';
import {
  BasketFabricRoll,
  BasketFabricRollDetail,
  BasketLocation,
  RIdAndMaRo,
} from '../../domain/entities/basket.js';
import sql from 'mssql';

@Injectable()
export class BasketLocationRepository implements IBasketLocationRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async updateLocation(
    maRo: string,
    maViTri: string,
    nguoiCapNhat: string,
  ): Promise<BasketLocation> {
    const pool = await this.databaseService.getPool();
    const result = await pool.request().query(`
               EXEC lib_Ro_CapNhatViTri_New @MaRo=${maRo} @MaViTri=${maViTri} @NguoiCapNhat=${nguoiCapNhat}
        `);

    return result.recordset[0] as BasketLocation;
  }

  // Lấy danh sách cây vải trong rọ theo Item, Art, Lot, Màu
  async getFabricRollsByRo(
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

  //Lấy ra Id và MaRo
  async getBasketsByWarehouseLocation(
    KID: number,
    VTId: string,
  ): Promise<RIdAndMaRo[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('KId', sql.BigInt, KID)
      .input('VTId', sql.NVarChar(50), VTId)
      .execute('dbo.Lib_RO_TimTheoKho_ViTri');

    return result.recordset;
  }

  async getBasketFabricRolls(
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
}
