import {
  layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO,
  layTrangThaiTheoBarcodeMau_RequestDTO,
} from '../dtos/technical-department/technical-department-request.dto.js';
import {
  layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO,
  layTrangThaiTheoBarcodeMau_ResponseDTO,
  layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO,
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
}
