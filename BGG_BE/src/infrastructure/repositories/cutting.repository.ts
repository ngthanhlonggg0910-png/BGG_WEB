import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ICuttingRepository } from '../../domain/repositories/cutting.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import sql from 'mssql';
import {
  Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android,
  Cutting_LayDSMauVaiVaMauSanSanPham,
  Cutting_GetInfoRongVaDaiSoDo_TheoMaPhieu_Android,
  wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId,
  Cutting_PhieuHoachToan_ThongTinTrai,
  Cutting_PhieuHoachToan_TinhTrangKhoaPhieu,
  Cutting_PhieuHoachToan_TongSoLop,
  Cutting_PhieuHoachToan_CapNhatTrangThai,
  Cutting_KiemTraCayVaiTruocKhiNoi,
  Cutting_VaiNoi_LayThongTinCay,
  Cutting_VaiNoi_QuetNhanCayGoc,
  Cutting_HoachToanThuong_QuetNhanCay,
  Cutting_VaiNoi_DanhSachCayNoiBaoGomCayGoc,
  Cutting_VaiNoi_ThemCayTiep,
} from '../../domain/entities/cutting.entity.js';
import {
  Cutting_HoachToanThuong_QuetNhanCay_RequestDTO,
  quetNhanCayGoc_RequestDTO,
} from '../../application/dtos/cutting-request.dto.js';

@Injectable()
export class CuttingRepository implements ICuttingRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async loadDanhSachBanCat(TKId: number): Promise<{ TenBanCat: string }[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('TKId', sql.BigInt, TKId)
      .execute('CUTTING_LAYDANHSACH_BANCAT_THEO_TKID');
    return result.recordset;
  }

  async loadDanhSachPhieuHoachToan(
    MaHang: string,
    SoPhieu: string,
    NgayHoachToan: Date,
    DaHoachToan: boolean,
    NhomCat: string,
    BanCat: string,
  ): Promise<Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android[]> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('MaHang', sql.NVarChar(200), MaHang)
      .input('SoPhieu', sql.NVarChar(200), SoPhieu)
      .input('NgayHachToan', sql.DateTime, NgayHoachToan)
      .input('DaHoachToan', sql.Bit, DaHoachToan)
      .input('NhomCat', sql.NVarChar(200), NhomCat)
      .input('BanCat', sql.NVarChar(200), BanCat)
      .execute('Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android');

    return result.recordset;
  }

  async loadDanhSachChiTietPhieuHoachToanTheoPHTId(
    PhieuHoachToanId: number,
    MaCay: string,
  ): Promise<wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .input('MaCay', sql.NVarChar(100), MaCay)
      .execute('wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId');
    return result.recordset;
  }

  async getChungLoaiByPHTId(
    PhieuHoachToanId: number,
  ): Promise<{ ChungLoai: string }[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .execute('CUTTING_PhieuHoachToan_Select_ChungLoai');
    return result.recordset;
  }

  async getDsMauVaiVaMauSanPhamTheoPHTId(
    PhieuHoachToanId: number,
  ): Promise<Cutting_LayDSMauVaiVaMauSanSanPham[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .execute('Cutting_LayDSMauVaiVaMauSanSanPham');
    return result.recordset;
  }

  async getDanhSachPOByPHTId(PhieuHoachToanId: number): Promise<string[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .execute('Cutting_PhieuHoachToan_DanhSachPO');

    return result.recordset.map((row: { PO: string | null }) => row.PO ?? '');
  }

  async getRongSdVaDaiSdTheoMaPhieu(
    MaPhieu: number,
  ): Promise<Cutting_GetInfoRongVaDaiSoDo_TheoMaPhieu_Android[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('MaPhieu', sql.Int, MaPhieu)
      .execute('Cutting_GetInfoRongVaDaiSoDo_TheoMaPhieu_Android');

    return result.recordset;
  }

  async getThongTinTraiByPHTId(
    PhieuHoachToanId: number,
  ): Promise<Cutting_PhieuHoachToan_ThongTinTrai | null> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId).query(`
        SELECT NguoiTrai, DaTrai, NgayGioTrai
        FROM CUTTING_PhieuHoachToan
        WHERE PhieuHoachToanId = @PhieuHoachToanId
      `);

    return result.recordset[0] ?? null;
  }

  async getTinhTrangKhoaPhieuByPHTId(
    PhieuHoachToanId: number,
  ): Promise<Cutting_PhieuHoachToan_TinhTrangKhoaPhieu | null> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId).query(`
        SELECT DaHoachToan, NguoiHachToan, NgayThang
        FROM CUTTING_PhieuHoachToan
        WHERE PhieuHoachToanId = @PhieuHoachToanId
      `);

    return result.recordset[0] ?? null;
  }

  async layTongSoLop(
    PhieuHoachToanId: number,
  ): Promise<Cutting_PhieuHoachToan_TongSoLop | null> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .execute('CUTTING_PhieuHoachToan_GetTongSoLop');

    return result.recordset[0] ?? null;
  }

  async capNhatHoachToan(
    PhieuHoachToanId: number,
    DaiBanTraiThucTe: number,
    KhoVaiThucTe: number,
    RongSoDo: number,
    DaiSoDo: number,
  ): Promise<void> {
    const pool = await this.databaseService.getPool();
    await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .input('DaiBanTraiThucTe', sql.Float, DaiBanTraiThucTe)
      .input('KhoVaiThucTe', sql.Float, KhoVaiThucTe)
      .input('RongSoDo', sql.Float, RongSoDo)
      .input('DaiSoDo', sql.Float, DaiSoDo)
      .execute('Cutting_PhieuHoachToan_CapNhatHachToan_Android');
  }

  async capNhatTraiVai(
    PhieuHoachToanId: number,
    TenNguoiTrai: string,
  ): Promise<void> {
    const pool = await this.databaseService.getPool();
    await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .input('TenNguoiTrai', sql.NVarChar(500), TenNguoiTrai)
      .execute('Cutting_PhieuHoachToan_CapNhatPHT_DaTrai');
  }

  async khoaPhieu(
    PhieuHoachToanId: number,
    DaHoachToan: boolean,
    TKId: number,
    NguoiKhoaPhieu: string,
  ): Promise<Cutting_PhieuHoachToan_CapNhatTrangThai | undefined> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .input('DaHoachToan', sql.Bit, DaHoachToan)
      .input('TKId', sql.BigInt, TKId)
      .input('NguoiKhoaPhieu', sql.NVarChar(200), NguoiKhoaPhieu)
      .execute('Cutting_PhieuHoachToan_CapNhatTrangThai');

    const recordsets = result.recordsets as sql.IRecordSet<any>[];

    let data: Cutting_PhieuHoachToan_CapNhatTrangThai | undefined;

    for (const recordset of recordsets) {
      const row = recordset.find((item) => typeof item.KetQua === 'number');

      if (row) {
        data = {
          ThongBao: row.ThongBao,
          KetQua: row.KetQua,
        };
        break;
      }
    }

    return data;
  }

  async kiemTraCayDeNoi(
    PhieuHoachToanId: number,
    ChiTietPhieuHoachToanId: number,
    MaCay: string,
  ): Promise<Cutting_KiemTraCayVaiTruocKhiNoi> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .input('ChiTietPhieuHoachToanId', sql.BigInt, ChiTietPhieuHoachToanId)
      .input('MaCay', sql.NVarChar(200), MaCay)
      .execute('Cutting_KiemTraCayVaiTruocKhiNoi');

    return result.recordset[0];
  }

  async layThongTinCayGoc(
    MaCay: string,
    PhieuHoachToanId: number,
  ): Promise<Cutting_VaiNoi_LayThongTinCay> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('MaCay', sql.NVarChar(200), MaCay)
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .execute('Cutting_VaiNoi_LayThongTinCay');
    return result.recordset[0];
  }

  async layDanhSachCayNoiBaoGomCayGoc(
    ChiTietPhieuHoachToanId: number,
  ): Promise<Cutting_VaiNoi_DanhSachCayNoiBaoGomCayGoc[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('ChiTietPhieuHoachToanId', sql.BigInt, ChiTietPhieuHoachToanId)
      .query(`
        SELECT *
        FROM CUTTING_PhieuHoachToan_ChiTiet_NoiCay
        WHERE ChiTietPhieuHoachToanId = @ChiTietPhieuHoachToanId
      `);

    return result.recordset;
  }

  async quetNhanCayGoc(
    dto: quetNhanCayGoc_RequestDTO,
  ): Promise<Cutting_VaiNoi_QuetNhanCayGoc | undefined> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, dto.PhieuHoachToanId)
      .input('MaCay', sql.NVarChar(200), dto.MaCay)
      .input('MauLot', sql.NVarChar(200), dto.MauLot ?? null)
      .input('MauVai', sql.NVarChar(200), dto.MauVai ?? null)
      .input('PO', sql.NVarChar(50), dto.PO ?? null)
      .input('MauSP', sql.NVarChar(50), dto.MauSP ?? null)
      .input('ChungLoai', sql.NVarChar(50), dto.ChungLoai ?? null)
      .input('Yard', sql.Float, dto.Yard)
      .input('Met', sql.Float, dto.Met)
      .input('ThucTe', sql.Float, dto.ThucTe)
      .input('Thua', sql.Float, dto.Thua)
      .input('Thieu', sql.Float, dto.Thieu)
      .input('SoMetTrai', sql.Float, dto.SoMetTrai)
      .input('TieuHaoThucTe', sql.Float, dto.TieuHaoThucTe)
      .input('NguyenCay', sql.Float, dto.NguyenCay)
      .input('SoBTP', sql.Int, dto.SoBTP)
      .input('ThuHoi1', sql.Float, dto.ThuHoi1)
      .input('ThuHoi2', sql.Float, dto.ThuHoi2)
      .input('ThuHoi3', sql.Float, dto.ThuHoi3)
      .input('ThuHoi4', sql.Float, dto.ThuHoi4)
      .input('ThuHoi5', sql.Float, dto.ThuHoi5)
      .execute('Cutting_VaiNoi_QuetNhanCayGoc');

    return result.recordset[0];
  }

  async quetNhanCayHoachToanThuong(
    dto: Cutting_HoachToanThuong_QuetNhanCay_RequestDTO,
  ): Promise<Cutting_HoachToanThuong_QuetNhanCay | undefined> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuHoachToanId', sql.BigInt, dto.PhieuHoachToanId)
      .input('MaCay', sql.NVarChar(200), dto.MaCay)
      .input('MauLot', sql.NVarChar(200), dto.MauLot ?? null)
      .input('MauVai', sql.NVarChar(200), dto.MauVai ?? null)
      .input('PO', sql.NVarChar(50), dto.PO ?? null)
      .input('MauSP', sql.NVarChar(50), dto.MauSP ?? null)
      .input('ChungLoai', sql.NVarChar(50), dto.ChungLoai ?? null)
      .input('Yard', sql.Float, dto.Yard ?? 0)
      .input('Met', sql.Float, dto.Met ?? 0)
      .input('ThucTe', sql.Float, dto.ThucTe ?? 0)
      .input('Thua', sql.Float, dto.Thua ?? 0)
      .input('Thieu', sql.Float, dto.Thieu ?? 0)
      .input('NguyenCay', sql.Float, dto.NguyenCay ?? 0)
      .input('SoBTP', sql.Int, dto.SoBTP ?? 0)
      .input('DauKhuc', sql.Float, dto.DauKhuc ?? 0)
      .input('ThayThan', sql.Float, dto.ThayThan ?? 0)
      .input('Cay', sql.Float, dto.Cay ?? null)
      .input('ThuHoi1', sql.Float, dto.ThuHoi1 ?? 0)
      .input('ThuHoi2', sql.Float, dto.ThuHoi2 ?? 0)
      .input('ThuHoi3', sql.Float, dto.ThuHoi3 ?? 0)
      .input('ThuHoi4', sql.Float, dto.ThuHoi4 ?? 0)
      .input('ThuHoi5', sql.Float, dto.ThuHoi5 ?? 0)
      .input('SoLopTrai', sql.Int, dto.SoLopTrai)
      .input('DaiBanTraiThucTe', sql.Float, dto.DaiBanTraiThucTe)
      .execute('Cutting_HoachToanThuong_QuetNhanCay');

    return result.recordset[0];
  }

  async themCayNoi(
    ChiTietPhieuHoachToanId: number,
    PhieuHoachToanId: number,
    MaCay: string,
    MauLot: string,
    MauVai: string,
    PO: string,
    Yard: number,
    Met: number,
    SoMetTrai: number,
    TieuHaoThucTe: number,
    ThucTe: number,
    Thua: number,
    Thieu: number,
    NguyenCay: number,
    ThuHoi1: number,
    ThuHoi2: number,
    ThuHoi3: number,
    ThuHoi4: number,
    ThuHoi5: number,
    SoBTP: number,
    Cay: number,
  ): Promise<Cutting_VaiNoi_ThemCayTiep> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('ChiTietPhieuHoachToanId', sql.BigInt, ChiTietPhieuHoachToanId)
      .input('PhieuHoachToanId', sql.BigInt, PhieuHoachToanId)
      .input('MaCay', sql.NVarChar(200), MaCay)
      .input('MauLot', sql.NVarChar(200), MauLot)
      .input('MauVai', sql.NVarChar(200), MauVai)
      .input('PO', sql.NVarChar(200), PO)
      .input('Yard', sql.Float, Yard)
      .input('Met', sql.Float, Met)
      .input('SoMetTrai', sql.Float, SoMetTrai)
      .input('TieuHaoThucTe', sql.Float, TieuHaoThucTe)
      .input('ThucTe', sql.Float, ThucTe)
      .input('Thua', sql.Float, Thua)
      .input('Thieu', sql.Float, Thieu)
      .input('NguyenCay', sql.Float, NguyenCay)
      .input('ThuHoi1', sql.Float, ThuHoi1)
      .input('ThuHoi2', sql.Float, ThuHoi2)
      .input('ThuHoi3', sql.Float, ThuHoi3)
      .input('ThuHoi4', sql.Float, ThuHoi4)
      .input('ThuHoi5', sql.Float, ThuHoi5)
      .input('SoBTP', sql.Int, SoBTP)
      .input('Cay', sql.Float, Cay)
      .execute('Cutting_VaiNoi_ThemCayTiep');

    const data = result.recordset?.[0];
    if (!data) {
      throw new InternalServerErrorException(
        'Stored procedure không trả về dữ liệu',
      );
    }

    return data;
  }
}
