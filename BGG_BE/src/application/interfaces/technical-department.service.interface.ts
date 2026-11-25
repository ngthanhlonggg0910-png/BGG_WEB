import {
  layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO,
  layTrangThaiTheoBarcodeMau_RequestDTO,
  layDanhSachFileTaiLieuTheoBarcodeMau_RequestDTO,
  capNhatTrangThai_TEC_BarcodeMau_RequestDTO,
  TEC_BarcodeMau_SelectThongTinKiemMau_RequestDTO,
  TEC_KiemMau_Master_KiemTraTonTai_RequestDTO,
  TEC_KiemMau_Detail_Insert_RequestDTO,
  TEC_KiemMau_Detail_Select_RequestDTO,
  TEC_KiemMau_Detail_Delete_RequestDTO,
  TEC_KiemMau_Detail_Update_RequestDTO,
} from '../dtos/technical-department/technical-department-request.dto.js';
import {
  layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO,
  layTrangThaiTheoBarcodeMau_ResponseDTO,
  layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO,
  layTrangThaiTheoLoaiVaBarcodeMau_ResponseDTO,
  capNhatTrangThai_TEC_BarcodeMau_ResponseDTO,
  TEC_BarcodeMau_SelectThongTinKiemMau_ResponseDTO,
  layDanhSachLoi_ResponseDTO,
  TEC_KiemMau_Master_KiemTraTonTai_ResponseDTO,
  TEC_KiemMau_Detail_Insert_ResponseDTO,
  TEC_KiemMau_Detail_Select_ResponseDTO,
  TEC_KiemMau_Detail_Delete_ResponseDTO,
  TEC_KiemMau_Detail_Update_ResponseDTO,
} from '../dtos/technical-department/technical-department-response.dto.js';
export interface ITechnicalDepartmentService {
  layThongTinGiayDeNghiTheoBarcodeMau(
    dto: layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO,
  ): Promise<layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO>;

  layTrangThaiTheoBarcodeMau(
    dto: layTrangThaiTheoBarcodeMau_RequestDTO,
  ): Promise<layTrangThaiTheoBarcodeMau_ResponseDTO>;

  layDanhSachFileTaiLieuTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO>;

  layTrangThaiTheoLoaiVaBarcodeMau(
    dto: layDanhSachFileTaiLieuTheoBarcodeMau_RequestDTO,
  ): Promise<layTrangThaiTheoLoaiVaBarcodeMau_ResponseDTO>;

  capNhatTrangThai_TEC_BarcodeMau(
    dto: capNhatTrangThai_TEC_BarcodeMau_RequestDTO,
  ): Promise<capNhatTrangThai_TEC_BarcodeMau_ResponseDTO>;

  TEC_BarcodeMau_SelectThongTinKiemMau(
    dto: TEC_BarcodeMau_SelectThongTinKiemMau_RequestDTO,
  ): Promise<TEC_BarcodeMau_SelectThongTinKiemMau_ResponseDTO>;

  layDanhSachLoi(): Promise<layDanhSachLoi_ResponseDTO>;

  TEC_KiemMau_Master_KiemTraTonTai(
    dto: TEC_KiemMau_Master_KiemTraTonTai_RequestDTO,
  ): Promise<TEC_KiemMau_Master_KiemTraTonTai_ResponseDTO>;

  TEC_KiemMau_Detail_Insert(
    dto: TEC_KiemMau_Detail_Insert_RequestDTO,
    file?: Express.Multer.File,
  ): Promise<TEC_KiemMau_Detail_Insert_ResponseDTO>;

  TEC_KiemMau_Detail_Select(
    dto: TEC_KiemMau_Detail_Select_RequestDTO,
  ): Promise<TEC_KiemMau_Detail_Select_ResponseDTO>;

  TEC_KiemMau_Detail_Delete(
    dto: TEC_KiemMau_Detail_Delete_RequestDTO,
  ): Promise<TEC_KiemMau_Detail_Delete_ResponseDTO>;

  TEC_KiemMau_Detail_Update(
    dto: TEC_KiemMau_Detail_Update_RequestDTO,
    file?: Express.Multer.File,
  ): Promise<TEC_KiemMau_Detail_Update_ResponseDTO>;
}
