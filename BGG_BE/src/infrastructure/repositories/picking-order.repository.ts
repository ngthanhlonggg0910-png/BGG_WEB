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

    return result.recordset;
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
