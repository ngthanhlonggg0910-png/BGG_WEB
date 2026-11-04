import { IsIn, IsInt, IsNumber, isString, IsString } from 'class-validator';

export class wh_chitietphieugiamdinh_capnhat_tilekiem_RequestDTO {
  TiLe: number;
  LoaiTiLe: string;
  CTPGDId: number;
}

export class wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_RequestDTO {
  Option: string;
  CTPGDId: number;
}

export class wh_PhieuGiamDinh_CapNhatTrangThai_RequestDTO {
  PGDId: number;
  TrangThai: string;
  NoiDung: string;
  NguoiThayDoi: string;
  TaiKhoanThayDoi: string;
  MACAddress: string;
  ComputerName: string;
}

export class wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_RequestDTO {
  CTPGDId: number;
  MaLoi: string;
  SoLuongLoi: number;
  TenNguoiTao: string;
}
