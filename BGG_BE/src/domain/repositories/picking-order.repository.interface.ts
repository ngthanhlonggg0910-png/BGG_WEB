import { promises } from 'dns';
import {
  wh_DanhSachPhieuSoanHangNgayVaTinhTrang,
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android,
} from '../entities/picking-order.entity.js';

export interface IPickingOrderRepository {
  getDanhSachPhieuSoanHangTheoNgayVaTinhTrang(
    maKho: string,
    tkId: number,
    ngaySoan: Date,
    tinhTrang: string,
  ): Promise<wh_DanhSachPhieuSoanHangNgayVaTinhTrang[]>;

  getDanhSachChiTietPhieuSoanHangTheoPhieuSoanHangId(
    PhieuSoanHangId: number,
  ): Promise<wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId[]>;

  //Lấy danh sách vật tư theo mã rọ + phiếu sh
  getDanhSachVatTuTheoMaRoVaPhieuSoanHang(
    PhieuSoanHangId: number,
    SoRo: string,
  ): Promise<wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang[]>;

  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android(
    PhieuSoanHangId: number,
    MaCay: string,
    SoLuongThucSoan: number,
    TKQuet: number,
    TenNguoiQuyetXuat: string,
  ): Promise<wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android[]>;
}
