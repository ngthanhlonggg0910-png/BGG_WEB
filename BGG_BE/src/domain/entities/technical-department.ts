export class TEC_GetGiayDeNghi_ByBarcodeMau {
  StatusCode: number;
  BarcodeMau: string;
  MasterId: number;
  IdProductInformation: number;
  MaHang: string;
  Mua: string;
  Site: string;
  MaKhachHang: string;
  Brand: string;
  PLI: string | null;
  TenKTTP: string;
  ChungLoai: string;
  PePm: string | null;
  NgayDeNghi: Date | null;
  LoaiMau: string;
  HinhThucThanhToan: string;
  IsCoMau: boolean;
  R3Code: string | null;
  Mau: string;
  Size: string;
  SLXuat: number;
  SLLuu: number;
  TongSL: number;
  GhiChuKTTP: string | null;
  XacNhanQLPhong: boolean | null;
  NgayCat: Date | null;
  NhomMay: string | null;
  NgayYeuCauGuiMau: Date | null;
  NguoiYeuCauGuiMai: string | null;
  GhiChuCat: string | null;
  NgayDongBo: Date | null;
  NgayThucTeGuiMai: Date | null;
  KetQuaDuyetMau: string | null;
  NgayNhanKQDuyetMau: Date | null;
  KqGOPROD: string | null;
  LyDoNOK: string | null;
  LyDoNOKFrom: string | null;
  GhiChuTienDoMau: string | null;
  NgayGuiMau2: Date | null;
  KetQuaDuyetMau2: string | null;
  NgayNhanKQ2: Date | null;
  LyDoNOK2: string | null;
  GhiChuGui2: string | null;
  NgayXuat: Date | null;
  SLXuatThongKe: number | null;
  SLXuatConLai: number | null;
  GhiChuThongKe: string | null;
  XacNhanHoanThanhGiayDeNghi: boolean;
  NguoiXacNhan: string | null;
  ThoiGianXacNhan: Date | null;
  NguoiTao: string;
  TKId: number;
  ThoiGianTao: Date | null;
  NewRecolorCarryOver: string | null;
  DanhSachNguoiMayMau: string | null;
  SoNguoiMayMau: number;
  SoLanGuiMailAutonomy: number;
  NguoiChinhSuaMoiNhat: string | null;
}

export class TEC_GetTrangThai_ByBarCodeMau {
  TrangThai: string;
  TrangThaiAutonomy: string;
}

export class TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau {
  DuongDanLocal: string;
  TenLoaiTaiLieu: string;
  TenTaiLieu: string;
  NguoiTao: string;
  NgayTao: Date;
  TrangThai: string;
}

export class TEC_GetTrangThai_ByBarcodeMauAndLoai {
  TrangThai: string;
}

export class TEC_BarcodeMau_UpdateTrangThai_Mobile {
  RowsUpdated: number;
  RowsDeleted: number;
}

export class TEC_KiemMau_DanhSachLoi {
  id: number;
  ten: string;
  ma_loi: string;
  ten_loi: string;
  idloi: number;
}

export class TEC_KiemMau_Master_KiemTraTonTai {
  NewId: number;
}

export class TEC_KiemMau_Detail_Insert {
  NewId: number;
}

export class TEC_KiemMau_Detail_Select {
  ViTriLoi: string;
  NguoiKhaiBao: string;
  ThoiGianKhaiBao: Date;
  MucDoNghiemTrong: string;
  MaLoi: string;
  TenLoi: string;
  SL: number;
  Image: string;
  BienPhapXuLy: string;
  LoaiKiem: string;
  GhiChu: string;
}
