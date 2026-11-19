export class Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android {
  PhieuHoachToanId: number;
  SoPhieu: string;
  NgayThang: Date;
  ThuTuPhieu: string;
  MaHang: string;
  LoaiNguyenLieu: string;
  TenSoDo: string;
  CoVocSoDo: string;
  RongSoDo: number;
  DaiSoDo: number;
  KhoVaiThucTe: number | null;
  DanBanTraiThucTe: number | null;
  NguoiTao: string;
  TenNguoiTao: string;
  NgayTao: Date;
  NhomCatId: number;
  LenhSanXuat: string;
  Mua: string;
  BanMay: string;
  MauVai: string;
  MauSanPham: string;
  PONo: string;
  Art: string;
  Tone: string;
  SoLop: number;
  TinhTrang: string;
  TrangThai: string;
  DaDuyetCBMH: boolean;
  DaHoachToan: boolean;
  DaTrai: boolean;
  NgayGioTrai: Date | null;
  TongSoLopDaTrai: number;
}

export class wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId {
  ChiTietPhieuHoachToanId: number;
  PhieuHoachToanId: number;
  NgayQuet: Date;
  MaCay: string;
  Yard: number;
  Met: number;
  ThucTe: number;
  Cay: number;
  Khuc: number;
  Thua: number;
  Thieu: number;
  SoLopTrai: number;
  TieuHaoThucTe: number;
  ThuHoiMot: number;
  ThuHoiHai: number;
  ThuHoiBa: number;
  NguyenCay: number;
  soBTP: number;
  Item: string;
  NguoiHoachToan: string;
  AnhMau: string;
  MauLot: string;
  MauVai: string;
  TachLop: string;
  PO: string;
  isVaiNoi: boolean;
  isDauKhuc: boolean;
  AnhMauGD: string;
  AnhMauPKV: string;
}

export class Cutting_LayDSMauVaiVaMauSanSanPham {
  MauVai: string;
  MauSanPham: string;
}

export class Cutting_GetInfoRongVaDaiSoDo_TheoMaPhieu_Android {
  KhoSoDo: number;
  DaiSoDo: number;
  STT: number;
}

export class Cutting_PhieuHoachToan_ThongTinTrai {
  NguoiTrai: string | null;
  DaTrai: boolean;
  NgayGioTrai: Date | null;
}

export class Cutting_PhieuHoachToan_TinhTrangKhoaPhieu {
  DaHoachToan: boolean;
  NguoiHachToan: string | null;
  NgayThang: Date | null;
}

export class Cutting_PhieuHoachToan_TongSoLop {
  TongSoLopDaTrai: number;
  TongSoLop: number;
}

export class Cutting_PhieuHoachToan_CapNhatTrangThai {
  ThongBao: string;
  KetQua: number;
}

export class Cutting_KiemTraCayVaiTruocKhiNoi {
  HopLe: boolean;
  ThongBao: string;
  PhieuHoachToanId: number;
  ChiTietPhieuHoachToan: number;
  MaCay: string;
  CayId: number;
  CTPGDId: number;
  SoMetBanDau: number;
  SoMetDaXuat: number;
  SoMetDaHoachToan: number;
  SoMetConLai: number;
}

export class Cutting_VaiNoi_LayThongTinCay {
  Item: string;
  MauLot: string;
  MaCay: string;
  Yard: number;
  Met: number;
  MetBanDau: number;
  SoLuongHoachToan: number;
  PhanTram: number;
  AnhMau: string;
  ProductionOrderNo: string;
  ThuHoi1: number;
  ThuHoi2: number;
  ThuHoi3: number;
  ThuHoi4: number;
  ThuHoi5: number;
}

export class Cutting_VaiNoi_QuetNhanCayGoc {
  ThanhCong: boolean;
  ThongBao: string;
  ChiTietPhieuHoachToanId: number | null;
  IdChiTietNoiCay: number | null;
}

export class Cutting_HoachToanThuong_QuetNhanCay {
  ThanhCong: boolean;
  ThongBao: string;
}

export class Cutting_VaiNoi_DanhSachCayNoiBaoGomCayGoc {
  IdChiTietNoiCay: number;
  ChiTietPhieuHoachToanId: number;
  PhieuHoachToanId: number | null;
  MauVai: string | null;
  MauLot: string | null;
  Yard: number | null;
  Met: number | null;
  ThucTe: number | null;
  Thua: number | null;
  Thieu: number | null;
  SoMetTrai: number | null;
  TieuHaoThucTe: number | null;
  NguyenCay: number | null;
  SoBTP: number | null;
  MaCay: string | null;
  DauKhuc: number | null;
  ThayThan: number | null;
  Cay: number | null;
  DaTraKho: number | null;
  DaXem: boolean | null;
  DaDuyetCBMH: boolean | null;
  CBMHDuyet: string | null;
  NgayGioDuyet: Date | null;
  NoiDungXuLyThieuVai: string | null;
  ThuHoiMot1: number | null;
  ThuHoiMot2: number | null;
  ThuHoiMot3: number | null;
  ThuHoiMot4: number | null;
  ThuHoiMot5: number | null;
  TachLop: string | null;
  PO: string | null;
  NgayQuet: Date | null;
  IdVaiMuon: number | null;
  ConLai1: number | null;
  ConLai2: number | null;
  ConLai3: number | null;
  ConLai4: number | null;
  ConLai5: number | null;
  isDauKhuc: boolean | null;
  SoDauKhuc: number | null;
}

export class Cutting_VaiNoi_ThemCayTiep {
  ThanhCong: boolean;
  ThongBao: string;
  ChiTietPhieuHoachToanId: number | null;
  IdChiTietNoiCay: number | null;
}
