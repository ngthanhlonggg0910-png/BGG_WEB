export class wh_DanhSachPhieuGiamDinhTheoThoiGian_RequestDTO {
  LoaiGiamDinh: string;
  KieuThoiGian: string;
  NgayBatDau: Date;
  NgayKetThuc: Date;
  TrangThai: string;
}

export class wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO {
  CTPGDId: number;
  SL: number;
  TKId: number;
  TenNguoiTao: string;
  NguoiTao: number;
  NoiDung: string;
  NguoiThayDoi: string;
  TaiKhoanThayDoi: string;
  MACAddress: string;
  ComputerName: string;
  MaSoKien: string;
  MaKho: string;
  SoMet: number;
  SoYard: number;
  SoGross: number;
  QrTrangMapping: string;
}

export class updateScannedRoll_RequestDTO {
  SL: number;
  CayId: number;
  CTPGDId: number;
}

export class deleteScannedRoll_RequestDTO {
  MaCay: string;
}
