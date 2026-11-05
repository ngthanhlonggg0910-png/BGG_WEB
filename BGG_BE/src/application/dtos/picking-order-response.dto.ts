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

export class wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang_ResponseDTO {
  success: boolean;
  message: string;
  data: wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang[];
}

export class wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_ResponseDTO {
  success: boolean;
  message: string;
  data: wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android[];
}

export class DotXuatItemDTO {
  dotXuatId: number;
  soDot: number;
  soPhieu: string;
  ngayXuat: Date;
  nguoiXuat: string;
  soCay: number;
  tongSoLuong: number;
}

export class TienDoSoanHangData {
  phieuSoanHangId: number;
  maSoPhieuSoan: string;
  tinhTrang: string;
  loaiLenh: string;
  lenhId: number;
  tongMatHang: number;
  matHangDaDu: number;
  tongSoLuongYeuCau: number;
  tongSoLuongThucSoan: number;
  phanTramTienDo: number;
  isDu100: boolean;
  tongSoCayDaQuet: number;
  soCayChuaChotDot: number;
  soLuongChuaChotDot: number;
  soDotXuat: number;
  danhSachDotXuat: DotXuatItemDTO[];
}

export class wh_KiemTraTienDoSoanHang_ResponseDTO {
  success: boolean;
  message: string;
  data: TienDoSoanHangData;
}

export class XacNhanXuatKhoData {
  dotXuatId: number;
  soDot: number;
  tinhTrang: string;
  isHoanThanh: boolean;
  soCayMoiXuat: number;
  tongSoCayDaQuet: number;
}

export class wh_XacNhanXuatKho_ResponseDTO {
  success: boolean;
  message: string;
  data?: XacNhanXuatKhoData;
}
