import { layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO } from '../dtos/technical-department/technical-department-request.dto.js';
import { layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO } from '../dtos/technical-department/technical-department-response.dto.js';
export interface ITechnicalDepartmentService {
  layThongTinGiayDeNghiTheoBarcodeMau(
    dto: layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO,
  ): Promise<layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO>;
}
