import sql from 'mssql';
import { Injectable } from '@nestjs/common';
import { ITechnicalDepartmentRepository } from '../../domain/repositories/technical-department.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import {
  TEC_BarcodeMau_UpdateTrangThai_Mobile,
  TEC_BarcodeMau_SelectThongTinKiemMau,
  TEC_GetGiayDeNghi_ByBarcodeMau,
  TEC_GetTrangThai_ByBarCodeMau,
  TEC_GetTrangThai_ByBarcodeMauAndLoai,
  TEC_KiemMau_DanhSachLoi,
  TEC_KiemMau_Detail_Insert,
  TEC_KiemMau_Detail_Select,
  TEC_KiemMau_Master_KiemTraTonTai,
  TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau,
} from '../../domain/entities/technical-department.js';

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

  async TEC_BarcodeMau_SelectThongTinKiemMau(
    BarcodeMau: string,
  ): Promise<TEC_BarcodeMau_SelectThongTinKiemMau> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('BarcodeMau', sql.NVarChar(200), BarcodeMau)
      .query(
        `
          SELECT
            Id AS BarcodeMauId,
            MasterId,
            isSua,
            BarcodeMau,
            MaHang,
            Mua,
            Size,
            Color AS Mau,
            LoaiMau,
            Supplier AS NhaCungCap,
            DPP,
            [Date] AS NgayTao,
            TrangThai,
            TrangThaiAutonomy
          FROM dbo.TEC_BarcodeMau
          WHERE BarcodeMau = @BarcodeMau
        `,
      );
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
    Image: string | null,
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
      .input('Image', sql.NVarChar(1000), Image || null)
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
            a.IdDetail,
            a.IdKiemMauMaster,
            a.BarcodeMau,
            a.ViTriLoi,
            a.NguoiKhaiBao,
            a.ThoiGianKhaiBao,
            a.MucDoNghiemTrong,
            a.MaLoi,
            a.TenLoi,
            a.SL,
            a.ImagePath,
            a.BienPhapXuLy,
            a.GhiChu,
            a.CumLoiId,
            a.KetQuaCuoi,
            a.LoaiKiem,
            b.ten as TenCumLoi
          from TEC_KiemMau_Detail a
          join TEC_CumLoi b on a.CumLoiId = b.id
          where a.BarcodeMau = @BarcodeMau
       `,
      );
    return result.recordset;
  }

  async TEC_KiemMau_Detail_Delete(IdDetail: number): Promise<number> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('IdDetail', sql.BigInt, IdDetail)
      .query('DELETE FROM TEC_KiemMau_Detail WHERE IdDetail = @IdDetail');

    return result.rowsAffected[0] ?? 0;
  }

  async TEC_KiemMau_Detail_LayImagePath(
    IdDetail: number,
  ): Promise<string | null | undefined> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('IdDetail', sql.BigInt, IdDetail)
      .query(
        'SELECT ImagePath FROM dbo.TEC_KiemMau_Detail WHERE IdDetail = @IdDetail',
      );

    if (!result.recordset[0]) return undefined;
    return result.recordset[0].ImagePath ?? null;
  }

  async TEC_KiemMau_Detail_DemSuDungImagePath(
    ImagePath: string,
  ): Promise<number> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('ImagePath', sql.NVarChar(1000), ImagePath)
      .query(
        'SELECT COUNT_BIG(1) AS ReferenceCount FROM dbo.TEC_KiemMau_Detail WHERE ImagePath = @ImagePath',
      );

    return Number(result.recordset[0]?.ReferenceCount ?? 0);
  }

  async TEC_KiemMau_Detail_Update(
    IdDetail: number,
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
    Image: string | null,
    RemoveImage: boolean,
  ): Promise<{ UpdatedId: number }> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('IdDetail', sql.BigInt, IdDetail)
      .input('IdKiemMauMaster', sql.BigInt, IdKiemMauMaster)
      .input('BarcodeMau', sql.NVarChar(200), BarcodeMau)
      .input('ViTriLoi', sql.NVarChar(200), ViTriLoi)
      .input('NguoiKhaiBao', sql.NVarChar(200), NguoiKhaiBao)
      .input('MucDoNghiemTrong', sql.NVarChar(200), MucDoNghiemTrong)
      .input('MaLoi', sql.NVarChar(200), MaLoi)
      .input('TenLoi', sql.NVarChar(200), TenLoi)
      .input('CumLoiId', sql.BigInt, CumLoiId)
      .input('SL', sql.Int, SL)
      .input('BienPhapXuLy', sql.NVarChar(200), BienPhapXuLy)
      .input('GhiChu', sql.NVarChar(sql.MAX), GhiChu)
      .input('LoaiKiem', sql.NVarChar(200), LoaiKiem)
      .input('Image', sql.NVarChar(1000), Image)
      .input('RemoveImage', sql.Bit, RemoveImage)
      .execute('TEC_KiemMau_Detail_Update');
    return result.recordset[0];
  }
}
