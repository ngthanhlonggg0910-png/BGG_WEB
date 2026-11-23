import sql, { MAX } from 'mssql';
import { Injectable } from '@nestjs/common';
import { ITechnicalDepartmentRepository } from '../../domain/repositories/technical-department.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import {
  TEC_BarcodeMau_UpdateTrangThai_Mobile,
  TEC_GetGiayDeNghi_ByBarcodeMau,
  TEC_GetTrangThai_ByBarCodeMau,
  TEC_GetTrangThai_ByBarcodeMauAndLoai,
  TEC_KiemMau_DanhSachLoi,
  TEC_KiemMau_Detail_Insert,
  TEC_KiemMau_Detail_Select,
  TEC_KiemMau_Master_KiemTraTonTai,
  TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau,
} from '../../domain/entities/technical-department.js';
import { Max } from 'class-validator';

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

  async layTrangThaiTheoLoaiVaBarcodeMau(
    BarcodeMau: string,
    Loai: string,
  ): Promise<TEC_GetTrangThai_ByBarcodeMauAndLoai> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('BarcodeMau', sql.NVarChar(200), BarcodeMau)
      .input('Loai', sql.NVarChar(200), Loai)
      .execute('TEC_GetTrangThai_ByBarcodeMauAndLoai');
    return result.recordset[0];
  }

  async capNhatTrangThai_TEC_BarcodeMau(
    TrangThai: string,
    isSua: boolean,
    BarcodeMau: string,
    LoaiKiemMau: string,
  ): Promise<TEC_BarcodeMau_UpdateTrangThai_Mobile> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('TrangThai', sql.NVarChar(200), TrangThai)
      .input('isSua', sql.Bit, isSua)
      .input('Barcode', sql.NVarChar(200), BarcodeMau)
      .input('LoaiKiemMau', sql.NVarChar(200), LoaiKiemMau)
      .execute('TEC_BarcodeMau_UpdateTrangThai_Mobile');
    return result.recordset[0];
  }

  async layDanhSachLoi(): Promise<TEC_KiemMau_DanhSachLoi[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool.request().execute('TEC_KiemMau_DanhSachLoi');
    return result.recordset;
  }

  async TEC_KiemMau_Master_KiemTraTonTai(
    BarcodeMau: string,
    LoaiKiem: string,
    NguoiKiemMau: string,
    TKId: number,
  ): Promise<TEC_KiemMau_Master_KiemTraTonTai> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('BarcodeMau', sql.NVarChar(200), BarcodeMau)
      .input('LoaiKiem', sql.NVarChar(200), LoaiKiem)
      .input('NguoiKiemMau', sql.NVarChar(200), NguoiKiemMau)
      .input('TKId', sql.BigInt, TKId)
      .execute('TEC_KiemMau_Master_KiemTraTonTai');
    return result.recordset[0];
  }

  async TEC_KiemMau_Detail_Insert(
    IdKiemMauMaster: number,
    BarcodeMau: string,
    ViTriLoi: string,
    NguoiKhaiBao: string,
    MucDoNghiemTrong: string,
    MaLoi: string,
    TenLoi: string,
    CumLoiId: number,
    SL: number,
    BienPhapXuLy: string,
    GhiChu: string,
    LoaiKiem: string,
    Image: string,
  ): Promise<TEC_KiemMau_Detail_Insert> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('IdKiemMauMaster', sql.BigInt, IdKiemMauMaster)
      .input('BarcodeMau', sql.NVarChar(200), BarcodeMau)
      .input('ViTriLoi', sql.NVarChar(200), ViTriLoi)
      .input('NguoiKhaiBao', sql.NVarChar(200), NguoiKhaiBao)
      .input('MucDoNghiemTrong', sql.NVarChar(200), MucDoNghiemTrong)
      .input('MaLoi', sql.NVarChar(200), MaLoi)
      .input('TenLoi', sql.NVarChar(200), TenLoi)
      .input('CumLoiId', sql.BigInt, CumLoiId)
      .input('SL', sql.BigInt, SL)
      .input('BienPhapXuLy', sql.NVarChar(200), BienPhapXuLy)
      .input('GhiChu', sql.NVarChar(sql.MAX), GhiChu)
      .input('LoaiKiem', sql.NVarChar(200), LoaiKiem)
      .input(
        'Image',
        sql.VarBinary(sql.MAX),
        Image ? Buffer.from(Image, 'base64') : null,
      )
      .execute('TEC_KiemMau_Detail_Insert');
    return result.recordset[0];
  }

  async TEC_KiemMau_Detail_Select(
    BarcodeMau: string,
  ): Promise<TEC_KiemMau_Detail_Select[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('BarcodeMau', sql.NVarChar(200), BarcodeMau)
      .query(
        `
        select 
          ViTriLoi,
          NguoiKhaiBao,
          ThoiGianKhaiBao,
          MucDoNghiemTrong,
          MaLoi,
          TenLoi,
          SL,
          Image,
          BienPhapXuLy,
          LoaiKiem,
          GhiChu
        from TEC_KiemMau_Detail 
        where BarcodeMau = @BarcodeMau
      `,
      );
    return result.recordset;
  }
}
