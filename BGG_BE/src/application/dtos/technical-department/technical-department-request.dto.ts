export class layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO {
  BarcodeMau: string;
}

export class layTrangThaiTheoBarcodeMau_RequestDTO {
  BarcodeMau: string;
}

export class layDanhSachFileTaiLieuTheoBarcodeMau_RequestDTO {
  BarcodeMau: string;
}

export class layTrangThaiTheoLoaiVaBarcodeMau_RequestDTO {
  BarcodeMau: string;
  Loai: string;
}

export class capNhatTrangThai_TEC_BarcodeMau_RequestDTO {
  TrangThai: string;
  isSua: boolean;
  BarcodeMau: string;
  LoaiKiemMau: string;
}

export class TEC_KiemMau_Master_KiemTraTonTai_RequestDTO {
  BarcodeMau: string;
  LoaiKiem: string;
  NguoiKiemMau: string;
  TKId: number;
}

export class TEC_KiemMau_Detail_Insert_RequestDTO {
  IdKiemMauMaster: number;
  BarcodeMau: string;
  ViTriLoi: string;
  NguoiKhaiBao: string;
  MucDoNghiemTrong: string;
  MaLoi: string;
  TenLoi: string;
  CumLoiId: number;
  SL: number;
  BienPhapXuLy: string;
  GhiChu: string;
  LoaiKiem: string;
  Image: string;
}

export class TEC_KiemMau_Detail_Select_RequestDTO {
  BarcodeMau: string;
}
