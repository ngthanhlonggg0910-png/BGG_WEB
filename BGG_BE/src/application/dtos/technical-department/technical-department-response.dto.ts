import {
  TEC_GetGiayDeNghi_ByBarcodeMau,
  TEC_GetTrangThai_ByBarCodeMau,
  TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau,
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
