//Lấy danh sách Phiếu soạn hàng theo Mã kho, ngày và tính trạng
export class wh_DanhSachPhieuSoanHangNgayVaTinhTrang {
  NgaySoan: Date;
  NgayTao: Date;
  NguoiTao: number;
  PhieuSoanHangId: number;
  TenNguoiTao: string;
  TinhTrang: string;
  TKId: number;
  DDH: string;
  NguoiDat: string;
  PO: string;
  NgayGiaoHang: Date;
  MaHang: Date;
  CapCho: string;
}

//Lấy ra phiếu chi tiết phiếu soạn hàng theo ID
export class wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId {
  DienGiai: string;
  SoLuongThucSoan: number;
  SoLuongYeuCau: number;
  VTId: number;
  ChiTietPhieuSoanHangId: number;
  PhieuSoanHangId: number;
  DDHPOId: number;
  CTLCPId: number;
  POLCPId: number;
  MaChungLoai?: string;
  Item?: string;
  MaMau?: string;
  DVT?: string;
  QuyCach?: string;
  MaVatTuGhep?: string;
  LoaiNPL?: string;
}

//Lấy danh sách vật tư theo mã rọ và PSH
export class wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang {
  MaCay: string;
  NgayNhapKho: Date;
  MaHangPO: Date;
  TenNPL: string;
  Lot: string;
  FA: string;
  SLBD: number;
  MaRo: string;
}

//Ghi nhận việc soạn hàng bằng cách quét mã cây vải,
//phân bổ số lượng thực soạn vào các dòng chi tiết phiếu soạn hàng
//và cập nhật số lượng đã xuất.
export class wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android {
  KetQua: number;
  Id: number;
  MaCay: string;
  ChiTietPhieuSoanHangId: number;
  SoLuong: number;
  CayId: number;
  Loi: string;
}

//Lấy ra thông tin 
export class wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHangVaMaCay {

}
