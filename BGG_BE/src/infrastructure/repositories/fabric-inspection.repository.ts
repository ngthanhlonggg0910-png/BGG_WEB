import { Injectable } from '@nestjs/common';
import sql from 'mssql';
import { IFabricInspectionRepository } from '../../domain/repositories/fbabric-inspection.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import {
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi,
  QM_PhieuKiemVai_Cay_ChiTiet,
  QM_PhieuKiemVai_CayVai_TheoPKVId,
  QM_PhieuKiemVai_TheoTKId,
  QM_DoKhoVai,
  QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile,
  QM_PhieuKiemVai_ThemCayVaoPhieu,
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

  async layChiTietCayVai(CTId: number): Promise<QM_PhieuKiemVai_Cay_ChiTiet[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool.request().input('CTId', sql.BigInt, CTId).query(`
        SELECT CTLId, MaLoi, TenLoi, ViTri, TongDiem AS TongDIem
        FROM QM_PhieuKiemVai_Cay_ChiTiet
        WHERE CTId = @CTId
      `);
    return result.recordset;
  }

  async themLoiCayVai(
    CTId: number,
    MaLoi: string,
    TenLoi: string,
    ViTriKiem: string,
    SoDiem: number,
    TuViTri: number,
    DenViTri: number,
    SoLoi: number,
    TongDiem: number,
    SoDiemTrungBinh: number,
    SoYard: number,
  ): Promise<void> {
    const pool = await this.databaseService.getPool();
    await pool
      .request()
      .input('CTId', sql.BigInt, CTId)
      .input('MaLoi', sql.NVarChar(200), MaLoi)
      .input('TenLoi', sql.NVarChar(200), TenLoi)
      .input('ViTriKiem', sql.NVarChar(200), ViTriKiem)
      .input('SoDiem', sql.BigInt, SoDiem)
      .input('TuViTri', sql.BigInt, TuViTri)
      .input('DenViTri', sql.BigInt, DenViTri)
      .input('SoLoi', sql.BigInt, SoLoi)
      .input('TongDiem', sql.Float, TongDiem)
      .input('SoDiemTrungBinh', sql.Float(), SoDiemTrungBinh)
      .input('SoYard', sql.Float(), SoYard)
      .execute('QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi');
  }

  async doKho(
    CTId: number,
    ViTri: string,
    KhoCM: number,
    KhoIN: number,
  ): Promise<void> {
    const pool = await this.databaseService.getPool();
    await pool
      .request()
      .input('CTId', sql.BigInt, CTId)
      .input('ViTri', sql.NVarChar(200), ViTri)
      .input('KhoCM', sql.Float, KhoCM)
      .input('KhoIN', sql.Float, KhoIN)
      .execute('QM_DoKhoVai_ThemMoi');
  }

  async layKetQuaDo(CTId: number): Promise<QM_DoKhoVai[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('CTId', sql.BigInt, CTId)
      .query('select * from QM_DoKhoVai where CTId = @CTId');
    return result.recordset;
  }

  async capNhatGhiChuHuongXuLyCayVai(
    CTId: number,
    GhiChu: string,
    HuongXuLy: string,
  ): Promise<void> {
    const pool = await this.databaseService.getPool();
    await pool
      .request()
      .input('CTId', sql.BigInt, CTId)
      .input('GhiChu', sql.NVarChar(sql.MAX), GhiChu)
      .input('HuongXuLy', sql.NVarChar(sql.MAX), HuongXuLy)
      .execute('QM_PhieuKiemVai_CayVai_CapNhatGhiChu');
  }

  async xoaCayVai(
    CTId: number,
    CayId: number,
    MaCayVai: string,
  ): Promise<void> {
    const pool = await this.databaseService.getPool();
    await pool
      .request()
      .input('CTId', sql.BigInt, CTId)
      .input('CayId', sql.BigInt, CayId)
      .input('MaCayVai', sql.NVarChar(200), MaCayVai).query(`
        DELETE FROM QM_PhieuKiemVai_CayVai
        WHERE CTId = @CTId
          AND CayId = @CayId
          AND MaCayVai = @MaCayVai
      `);
  }

  async xongCayVai(
    CTId: number,
    GhiChu: string,
    KetQuaKiem: boolean,
    KetQuaDoAm: boolean,
    DoAm: number,
    DiemTrungBinh: number,
    SoLuongThucTe: number,
    NguoiXongCay: string,
    TrongLuongVai: string,
  ): Promise<void> {
    const pool = await this.databaseService.getPool();
    await pool
      .request()
      .input('CTId', sql.BigInt, CTId)
      .input('GhiChu', sql.NVarChar(200), GhiChu)
      .input('KetQuaKiem', sql.Bit, KetQuaKiem)
      .input('KetQuaDoAm', sql.Bit, KetQuaDoAm)
      .input('DoAm', sql.Float, DoAm)
      .input('DiemTrungBinh', sql.Float, DiemTrungBinh)
      .input('SoLuongThucTe', sql.Float, SoLuongThucTe)
      .input('NguoiXongCay', sql.NVarChar(200), NguoiXongCay)
      .input('TrongLuongVai', sql.NVarChar(200), TrongLuongVai)
      .execute('QM_PhieuKiemVai_CayVai_XongCay_Android');
  }

  async taoPhieuKiemVaiAuto(
    TKId: number,
    MaCay: string,
  ): Promise<QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('TKId', sql.BigInt, TKId)
      .input('MaCay', sql.NVarChar(200), MaCay)
      .execute('QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile');
    return result.recordset[0];
  }

  async themCayVaoPhieu(
    TKId: number,
    MaCay: string,
    PKVId: number,
  ): Promise<QM_PhieuKiemVai_ThemCayVaoPhieu> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('TKId', sql.BigInt, TKId)
      .input('MaCay', sql.NVarChar(200), MaCay)
      .input('PKVId', sql.BigInt, PKVId)
      .execute('QM_PhieuKiemVai_ThemCayVaoPhieu');
    return result.recordset[0];
  }

  async taoPhieuKiemThuCong(
    TKId: number,
    MaHang: string,
    ChungLoai: string,
    Item: string,
    Art: string,
    TenMau: string,
    NgayKiemVai: Date,
    NhaCungCap: string,
    LOT: string,
  ): Promise<{ SoPhieuKiem: string }> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('TKId', sql.BigInt, TKId)
      .input('MaHang', sql.NVarChar(200), MaHang)
      .input('ChungLoai', sql.NVarChar(200), ChungLoai)
      .input('Item', sql.NVarChar(200), Item)
      .input('Art', sql.NVarChar(200), Art)
      .input('TenMau', sql.NVarChar(200), TenMau)
      .input('NgayKiemVai', sql.NVarChar(500), NgayKiemVai)
      .input('NhaCungCap', sql.NVarChar(200), NhaCungCap)
      .input('LOT', sql.NVarChar(200), LOT)
      .execute('QM_PhieuKiemVai_TaoPhieuKiem');
    return result.recordset[0];
  }

  async layDanhSachMaHang(): Promise<{ MaHang: string }[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool.request().query(`
          select 
              OMM_DonHang.MaHang
          from OMM_DonHang
          inner join WH_PhieuGiamDinh 
              on OMM_DonHang.DHId = WH_PhieuGiamDinh.DHId
          GROUP BY OMM_DonHang.MaHang
          ORDER BY MAX(NgayGiamDinh) DESC,OMM_DonHang.MaHang   
      `);
    return result.recordset;
  }

  async layDanhSachChungLoaiCoItem(
    MaHang: string,
    Item: string,
  ): Promise<{ TenChungLoai: string }[]> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('MaHang', sql.NVarChar(200), MaHang)
      .input('Item', sql.NVarChar(200), Item).query(`
      SELECT DISTINCT a.TenChungLoai
      FROM Lib_NguyenPhuLieu a
      INNER JOIN OMM_DonHang b ON a.DHId = b.DHId
      WHERE b.MaHang = @MaHang
        AND a.Item = @Item
    `);

    console.log('Repository result:', result.recordset);

    return result.recordset;
  }

  async layDanhSachChungLoaiKoItem(
    MaHang: string,
  ): Promise<{ TenChungLoai: string }[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('MaHang', sql.NVarChar(200), MaHang).query(`
        select distinct a.TenChungLoai
        from Lib_NguyenPhuLieu a
        join OMM_DonHang b on a.DHId = b.DHId
        where b.MaHang = @MaHang 
      `);
    return result.recordset;
  }

  async layDanhSachItem(MaHang: string): Promise<{ Item: string }[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('MaHang', sql.NVarChar(200), MaHang).query(`
        select distinct a.Item
        from Lib_NguyenPhuLieu a
        join OMM_DonHang b on a.DHId = b.DHId
        where MaHang = @MaHang
      `);

    return result.recordset;
  }

  async layMaMau(
    MaHang: string,
    Item: string = '',
    ChungLoai: string = '',
  ): Promise<{ MaMau: string }[]> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('MaHang', sql.NVarChar(200), MaHang)
      .input('Item', sql.NVarChar(200), Item ?? '')
      .input('ChungLoai', sql.NVarChar(200), ChungLoai ?? '').query(`
      SELECT DISTINCT a.MaMau
      FROM Lib_NguyenPhuLieu a
      JOIN OMM_DonHang b ON a.DHId = b.DHId
      WHERE b.MaHang = @MaHang
        AND (
          NULLIF(TRIM(@ChungLoai), N'') IS NULL
          OR a.TenChungLoai LIKE N'%' + TRIM(@ChungLoai) + N'%'
        )
        AND (
          NULLIF(TRIM(@Item), N'') IS NULL
          OR a.Item = @Item
        )
        AND a.MaMau IS NOT NULL
        AND LTRIM(RTRIM(a.MaMau)) <> '';
    `);

    return result.recordset;
  }

  async layArt(
    MaHang: string,
    Item: string = '',
    ChungLoai: string = '',
    MaMau: string = '',
  ): Promise<{ QuyCach: string }[]> {
    try {
      const pool = await this.databaseService.getPool();

      const result = await pool
        .request()
        .input('MaHang', sql.NVarChar(200), MaHang)
        .input('Item', sql.NVarChar(200), Item ?? '')
        .input('ChungLoai', sql.NVarChar(200), ChungLoai ?? '')
        .input('MaMau', sql.NVarChar(200), MaMau ?? '').query(`
        SELECT DISTINCT a.QuyCach
        FROM Lib_NguyenPhuLieu a
        INNER JOIN OMM_DonHang b ON a.DHId = b.DHId
        WHERE b.MaHang = @MaHang
          AND (
            NULLIF(TRIM(@ChungLoai), N'') IS NULL
            OR a.TenChungLoai LIKE N'%' + TRIM(@ChungLoai) + N'%'
          )
          AND (
            NULLIF(TRIM(@Item), N'') IS NULL
            OR a.Item = @Item
          )
          AND (
            NULLIF(TRIM(@MaMau), N'') IS NULL
            OR a.MaMau = @MaMau
          )
          AND a.QuyCach IS NOT NULL
          AND LTRIM(RTRIM(a.QuyCach)) <> '';
      `);

      return result.recordset;
    } catch (error) {
      console.error('SQL ERROR layArt:', error);
      throw error;
    }
  }
  async layLot(
    MaHang: string,
    Item: string = '',
    ChungLoai: string = '',
    MaMau: string = '',
    QuyCach: string = '',
  ): Promise<{ Lot: string }[]> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('MaHang', sql.NVarChar(200), MaHang)
      .input('Item', sql.NVarChar(200), Item ?? '')
      .input('ChungLoai', sql.NVarChar(200), ChungLoai ?? '')
      .input('MaMau', sql.NVarChar(200), MaMau ?? '')
      .input('Art', sql.NVarChar(200), QuyCach ?? '').query(`
      SELECT DISTINCT c.Lot
      FROM Lib_NguyenPhuLieu a
      JOIN OMM_DonHang b ON a.DHId = b.DHId
      JOIN WH_ChiTietPhieuGiamDinh c ON c.VTId = a.VTId
      WHERE b.MaHang = @MaHang
        AND (
          NULLIF(TRIM(@ChungLoai), N'') IS NULL
          OR a.TenChungLoai LIKE N'%' + TRIM(@ChungLoai) + N'%'
        )
        AND (
          NULLIF(TRIM(@Item), N'') IS NULL
          OR a.Item = @Item
        )
        AND (
          NULLIF(TRIM(@MaMau), N'') IS NULL
          OR a.MaMau = @MaMau
        )
        AND (
          NULLIF(TRIM(@Art), N'') IS NULL
          OR a.QuyCach = @Art
        )
        AND c.Lot IS NOT NULL
        AND LTRIM(RTRIM(c.Lot)) <> '';
    `);

    return result.recordset;
  }

  async layNCC(): Promise<{ TenNgan: string; NCCId: number }[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool.request().query(`
      SELECT TenNgan, NCCId
      FROM Lib_NhaCungCap
    `);

    return result.recordset;
  }
}
