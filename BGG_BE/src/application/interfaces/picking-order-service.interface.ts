import {
  wh_DanhSachPhieuSoanHangNgayVaTinhTrang_RequestDTO,
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_RequestDTO,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_RequestDTO,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_RequestDTO,
} from '../dtos/picking-order-request.dto.js';
import {
  wh_DanhSachPhieuSoanHang_TuNgayDenNgay_ResponseDTO,
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_ResponseDTO,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_ResponseDTO,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_ResponseDTO,
} from '../dtos/picking-order-response.dto.js';

export interface IPickingOrderService {
  //Lấy danh sách phiếu soạn hàng theo tình trạng,...
  getDanhSachPhieuSoanHangTheoNgayVaTinhTrang(
    dto: wh_DanhSachPhieuSoanHangNgayVaTinhTrang_RequestDTO,
  ): Promise<wh_DanhSachPhieuSoanHang_TuNgayDenNgay_ResponseDTO>;

  //Lấy ra chi tiết phiếu soạn hàng theo ID
  getDanhSachChiTietPhieuSoanHangTheoPhieuSoanHangId(
    dto: wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_RequestDTO,
  ): Promise<wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_ResponseDTO>;

  //Lấy ra danh sách vật tư theo mã rọ + psh
  getDanhSachVatTuTheoMaRoVaPhieuSoanHang(
    dto: wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_RequestDTO,
  ): Promise<wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_ResponseDTO>;

  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android(
    dto: wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_RequestDTO,
  ): Promise<wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_ResponseDTO>;
}
