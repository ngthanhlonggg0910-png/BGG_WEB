export class WH_PhieuGiamDinh_GetDanhSachTrangThai {
  TrangThai: string;
  TenTrangThai: string;
}

export class wh_DanhSachPhieuGiamDinhTheoThoiGian {
  pGDId: number;
  maPhieu: string;
  kHId: number;
  nguoiGiamDinh: number;
  ngayGiamDinh: Date;
  MaRo: string | null;
  Lo: string | null;
  TenNguoiChoKiem: string | null;
  ngayNhan: Date | null;
  loaiGiamDinh: string;
  lanBanHanh: number;
  ghiChu: string | null;
  danhSachPO: string | null;
  maHang: string | null;

  tenNguoiTao: string | null;
  tKId: number;
  trangThai: string;
  kId: number;
  vTId: number;
  tenDayDu: string | null;
  tenNgan: string | null;
  maKhachHang: string | null;
  dHId: number;
  maKho: string | null;
  tenKho: string | null;
  tenViTri: string | null;
  DocNo: string | null;
  LoaiPhieuBravo: number;
  NguoiXacNhan: string | null;
  NgayXacNhan: Date | null;

  PONo: string | null;
  Bill: string | null;
}

export class WH_PhieuGiamDinh_GetData_ByBarcodeKien {
  isPhieuThuong: boolean;
  pGDId: number;
  ngayGiamDinh: Date;
  maPhieu: string;
  trangThai: string;
  maHang: string;
  loaiGiamDinh: string;
  MaRo: string;
  Lo: string;
  tenNguoiTao: string;
  tenNguoiGiamDinh: string;
}

export class WH_ChiTietPhieuGiamDinh_PGDId {
  CTPGDId: number;
  VTId: number;
  DHId: number;
  MaChungLoai: string;
  TenChungLoai: string;
  Item: string;
  MaMau: string;
  ThanhPhan: string;
  KhoVatTu: string;
  Size: string;
  MaHQ: string;
  DVT: string;
  QuyCach: string;
  MatVatTuGhep: string;
  LoaiNPL: string;
  DienGiai: string;
  GhiChuNPL: string;
  NguoiTao: number;
  TenNguoiTao: string;
  NgayTao: Date;
  TKId: number;
  MauSanPham: string | null;
  MaChungLoaiLienQuan: string | null;
  NgonNguId: number | null;
  contentNPL: string | null;
  VTCId: number;
  ViTriNPL: string | null;
  Care: string | null;
  SLKDat: number;
  SLDat: number;
  SLKiem: number;
  ChungTu: string;
  Lot: string | null;
  Kho: string | null;
  FA: string | null;
  PKList: string | null;
  KhoInch: string | null;
  Brand: string | null;
  DuongKinh: number | null;
  NCCIdGoc: number | null;
  ChoXuLy: number | null;
  LoaiTiLe: string | null;
  HanSuDung: Date | null;
  TiLe: number | null;
  Lo: number | null;
  XuatVietTien: string | null;
  SizeCode: string | null;
  ArtCode: string | null;
  ItemCode: string | null;
  ProductCode: string | null;
  SoLuongChungTuThucTe: number;
}

export class wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile {
  KetQua: number;
  Id: number;
  Thieu: number;
}
