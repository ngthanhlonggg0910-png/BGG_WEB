import {
  TEC_GetGiayDeNghi_ByBarcodeMau,
  TEC_GetTrangThai_ByBarCodeMau,
  TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau,
} from '../entities/technical-department.js';

export interface ITechnicalDepartmentRepository {
  layThongTinGiayDeNghiTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_GetGiayDeNghi_ByBarcodeMau>;

  layTrangThaiTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_GetTrangThai_ByBarCodeMau>;

  layDanhSachFileTaiLieuTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau[]>;
}
