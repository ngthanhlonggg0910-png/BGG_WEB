import { TEC_GetGiayDeNghi_ByBarcodeMau } from '../entities/technical-department.js';

export interface ITechnicalDepartmentRepository {
  layThongTinGiayDeNghiTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_GetGiayDeNghi_ByBarcodeMau>;
}
