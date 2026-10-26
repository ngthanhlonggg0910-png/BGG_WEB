import sql, { Transaction } from 'mssql';
import { Injectable } from '@nestjs/common';
import { IMapingQrRepository } from '../../domain/repositories/mapping-qr.interface.repository.js';
import { DatabaseService } from '../database/database.service.js';
import {
  WH_ChiTietPhieuGiamDinh_PGDId,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile,
  wh_DanhSachPhieuGiamDinhTheoThoiGian,
  WH_PhieuGiamDinh_GetDanhSachTrangThai,
  WH_PhieuGiamDinh_GetData_ByBarcodeKien,
} from '../../domain/entities/mapping-qr.entity.js';
import { request } from 'http';

@Injectable()
export class MappingQrRepository implements IMapingQrRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getDanhSachTrangThaiPhieuGiamDinh(): Promise<
    WH_PhieuGiamDinh_GetDanhSachTrangThai[]
  > {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .execute('WH_PhieuGiamDinh_GetDanhSachTrangThai');
    return result.recordset;
  }

  async getDanhSachPhieuGiamDinhTheoThoiGian(
    LoaiGiamDinh: string,
    KieuThoiGian: string,
    NgayBatDau: Date,
    NgayKetThuc: Date,
    TrangThai: string,
  ): Promise<wh_DanhSachPhieuGiamDinhTheoThoiGian[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('LoaiGiamDinh', sql.NVarChar(200), LoaiGiamDinh)
      .input('KieuThoiGian', sql.NVarChar(50), KieuThoiGian)
      .input('NgayBatDau', sql.Date, NgayBatDau)
      .input('NgayKetThuc', sql.Date, NgayKetThuc)
      .input('TrangThai', sql.NVarChar(200), TrangThai)
      .execute('wh_DanhSachPhieuGiamDinhTheoThoiGian');

    return result.recordset ?? [];
  }

  async getDanhSachVatTuTheoBarcodeKien(
    Barcode: string,
  ): Promise<WH_PhieuGiamDinh_GetData_ByBarcodeKien[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('Barcode', sql.NVarChar(200), Barcode)
      .execute('WH_PhieuGiamDinh_GetData_ByBarcodeKien');
    return result.recordset;
  }

  async getChiTietPhieuGiamDinh(
    PGDId: number,
  ): Promise<WH_ChiTietPhieuGiamDinh_PGDId[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PGDId', sql.BigInt, PGDId)
      .execute('WH_ChiTietPhieuGiamDinh_PGDId');
    return result.recordset;
  }

  async saveMapping(
    CTPGDId: number,
    SL: number,
    TKId: number,
    TenNguoiTao: string,
    NguoiTao: number,
    NoiDung: string,
    NguoiThayDoi: string,
    TaiKhoanThayDoi: string,
    MACAddress: string,
    ComputerName: string,
    MaSoKien: string,
    MaKho: string,
    SoMet: number,
    SoYard: number,
    SoGross: number,
    QrTrangMapping: string,
  ): Promise<wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('CTPGDId', sql.BigInt, CTPGDId)
      .input('SL', sql.Real, SL)
      .input('TKId', sql.BigInt, TKId)
      .input('TenNguoiTao', sql.NVarChar(500), TenNguoiTao)
      .input('NguoiTao', sql.BigInt, NguoiTao)
      .input('NoiDung', sql.NVarChar(500), NoiDung)
      .input('NguoiThayDoi', sql.NVarChar(250), NguoiThayDoi)
      .input('TaiKhoanThayDoi', sql.NVarChar(250), TaiKhoanThayDoi)
      .input('MACAddress', sql.NVarChar(250), MACAddress)
      .input('ComputerName', sql.NVarChar(250), ComputerName)
      .input('MaSoKien', sql.NVarChar(250), MaSoKien)
      .input('MaKho', sql.NVarChar(250), MaKho)
      .input('SoMet', sql.Decimal(18, 4), SoMet)
      .input('SoYard', sql.Decimal(18, 4), SoYard)
      .input('SoGross', sql.Decimal(18, 4), SoGross)
      .input('QrTrangMapping', sql.NVarChar(50), QrTrangMapping)
      .execute('wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile');

    const row = result.recordset?.[0];

    if (!row) {
      throw new Error(`Procedure không trả kết quả cho CTPGDId ${CTPGDId}`);
    }

    return row;
  }
}
