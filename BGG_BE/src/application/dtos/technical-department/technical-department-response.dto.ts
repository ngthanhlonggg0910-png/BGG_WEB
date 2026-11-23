import {
  TEC_GetGiayDeNghi_ByBarcodeMau,
  TEC_GetTrangThai_ByBarCodeMau,
  TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau,
  TEC_GetTrangThai_ByBarcodeMauAndLoai,
  TEC_BarcodeMau_UpdateTrangThai_Mobile,
  TEC_KiemMau_DanhSachLoi,
  TEC_KiemMau_Master_KiemTraTonTai,
  TEC_KiemMau_Detail_Insert,
  TEC_KiemMau_Detail_Select,
} from '../../../domain/entities/technical-department.js';

export class layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_GetGiayDeNghi_ByBarcodeMau;
}

export class layTrangThaiTheoBarcodeMau_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_GetTrangThai_ByBarCodeMau;
}

export class layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau[];
}

export class layTrangThaiTheoLoaiVaBarcodeMau_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_GetTrangThai_ByBarcodeMauAndLoai;
}

export class capNhatTrangThai_TEC_BarcodeMau_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_BarcodeMau_UpdateTrangThai_Mobile;
}

export class layDanhSachLoi_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_KiemMau_DanhSachLoi[];
}

export class TEC_KiemMau_Master_KiemTraTonTai_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_KiemMau_Master_KiemTraTonTai;
}

export class TEC_KiemMau_Detail_Insert_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_KiemMau_Detail_Insert;
}

export class TEC_KiemMau_Detail_Select_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_KiemMau_Detail_Select[];
}
