import { TEC_GetGiayDeNghi_ByBarcodeMau } from '../../../domain/entities/technical-department.js';

export class layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO {
  success: boolean;
  message: string;
  data: TEC_GetGiayDeNghi_ByBarcodeMau;
}
