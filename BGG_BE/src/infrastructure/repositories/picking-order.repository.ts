import { Injectable } from '@nestjs/common';
import {
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android,
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId,
  wh_DanhSachPhieuSoanHangNgayVaTinhTrang,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang,
} from '../../domain/entities/picking-order.entity.js';
import { IPickingOrderRepository } from '../../domain/repositories/picking-order.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import sql from 'mssql';

@Injectable()
export class PickingOrderRepository implements IPickingOrderRepository {
  constructor(public readonly databaseService: DatabaseService) {}

  async getDanhSachPhieuSoanHangTheoNgayVaTinhTrang(
    maKho: string,
    tkId: number,
    ngaySoan: Date,
    tinhTrang: string,
  ): Promise<wh_DanhSachPhieuSoanHangNgayVaTinhTrang[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('maKho', sql.NVarChar(50), maKho)
      .input('tkId', sql.BigInt, tkId)
      .input('ngaySoan', sql.DateTime, ngaySoan)
      .input('tinhTrang', sql.NVarChar(50), tinhTrang)
      .execute('wh_DanhSachPhieuSoanHangNgayVaTinhTrang');

    const baseRecords: wh_DanhSachPhieuSoanHangNgayVaTinhTrang[] =
      result.recordset || [];

    // Bổ sung các Phiếu soạn hàng sinh từ Đơn đặt hàng LSX (LoaiLenh = 'DonDatHang')
    try {
      const lsxResult = await pool
        .request()
        .input('maKho', sql.NVarChar(50), (maKho || '').trim().toUpperCase())
        .input('ngaySoan', sql.DateTime, ngaySoan)
        .input('tinhTrang', sql.NVarChar(50), tinhTrang)
        .query(`
          SELECT 
            d.DonDatHangId AS DDHId,
            psh.MaSoPhieuSoan,
            psh.NgaySoan,
            psh.NgayTao,
            psh.NguoiTao,
            psh.PhieuSoanHangId,
            psh.TenNguoiTao,
            psh.TinhTrang,
            psh.TKId,
            d.SoDonDatHang AS DDH,
            ISNULL(d.NguoiDat, N'') + CASE WHEN ISNULL(d.GhiChu, N'') <> N'' THEN CHAR(10) + CHAR(10) + N'GHI CHÚ: ' + d.GhiChu + CHAR(10) ELSE N'' END AS NguoiDat,
            lsx.SoLSX AS PO,
            d.NgayCanGiao AS NgayGiaoHang,
            lsx.MaHang,
            CASE 
              WHEN d.LoaiDatHang = N'NguyenLieu' THEN N'Nhà cắt ' + ISNULL(lsx.NhaCat, N'')
              ELSE N'Tổ may ' + ISNULL(lsx.ToMay, N'')
            END AS CapCho
          FROM dbo.WH_PhieuSoanHang psh
          INNER JOIN dbo.OMM_DonDatHang_LSX d ON psh.LenhId = d.DonDatHangId
          INNER JOIN dbo.OMM_LenhSanXuat lsx ON d.LSXId = lsx.LSXId
          WHERE psh.LoaiLenh = N'DonDatHang'
            AND DATEDIFF(DAY, psh.NgaySoan, @ngaySoan) = 0
            AND (
              (@tinhTrang = N'hoanthanh' AND psh.TinhTrang = N'hoanthanh')
              OR (@tinhTrang <> N'hoanthanh' AND ISNULL(psh.TinhTrang, N'') NOT IN (N'hoanthanh', N'huy'))
            )
            AND (
              (@maKho = N'NA' AND (d.LoaiDatHang = N'NguyenLieu' OR psh.MaSoPhieuSoan LIKE N'NA%'))
              OR (@maKho = N'PA' AND (d.LoaiDatHang = N'PhuLieu' OR psh.MaSoPhieuSoan LIKE N'PA%' OR psh.MaSoPhieuSoan LIKE N'PL%'))
              OR psh.MaSoPhieuSoan LIKE @maKho + N'%'
            )
        `);

      const existingIds = new Set(baseRecords.map((r) => r.PhieuSoanHangId));
      for (const row of lsxResult.recordset || []) {
        if (!existingIds.has(row.PhieuSoanHangId)) {
          baseRecords.push(row);
        }
      }
    } catch (err) {
      console.error('Lỗi truy vấn bổ sung phiếu soạn LSX:', err);
    }

    return baseRecords;
  }

  async getDanhSachChiTietPhieuSoanHangTheoPhieuSoanHangId(
    PhieuSoanHangId: number,
  ): Promise<wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuSoanHangId', sql.BigInt, PhieuSoanHangId)
      .execute('wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId');
    return result.recordset;
  }

  async getDanhSachVatTuTheoMaRoVaPhieuSoanHang(
    PhieuSoanHangId: number,
    SoRo: string,
  ): Promise<wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuSoanHangId', sql.BigInt, PhieuSoanHangId)
      .input('SoRo', sql.NVarChar(200), SoRo)
      .execute('wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang');
    return result.recordset;
  }

  async wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android(
    PhieuSoanHangId: number,
    MaCay: string,
    SoLuongThucSoan: number,
    TKQuet: number,
    TenNguoiQuyetXuat: string,
  ): Promise<wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuSoanHangId', sql.BigInt, PhieuSoanHangId)
      .input('MaCay', sql.NVarChar(100), MaCay)
      .input('SoLuongThucSoan', sql.Real, SoLuongThucSoan)
      .input('TKQuet', sql.BigInt, TKQuet)
      .input('TenNguoiQuyetXuat', sql.NVarChar(200), TenNguoiQuyetXuat)
      .execute('wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Web');

    return result.recordset;
  }
}
