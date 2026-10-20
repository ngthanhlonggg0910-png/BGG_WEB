import {
  wh_DanhSachPhieuSoanHangNgayVaTinhTrang,
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android,
} from '../../domain/entities/picking-order.entity.js';

export class wh_DanhSachPhieuSoanHang_TuNgayDenNgay_ResponseDTO {
  success: boolean;
  message: string;
  data: wh_DanhSachPhieuSoanHangNgayVaTinhTrang[];
}

export class wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_ResponseDTO {
  success: boolean;
  message: string;
  data: wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId[];
}

export class wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_ResponseDTO {
  success: boolean;
  message: string;
  data: wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang[];
}

export class wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_ResponseDTO {
  success: boolean;
  message: string;
  data: wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android[];
}
