import {
  QM_PhieuKiemVai_TheoTKId,
  QM_PhieuKiemVai_CayVai_TheoPKVId,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi,
} from '../../domain/entities/fbabric-inspection.js';

export class QM_PhieuKiemVai_TheoTKId_ResponseDTO {
  success: boolean;
  message: string;
  data: QM_PhieuKiemVai_TheoTKId[];
}

export class QM_PhieuKiemVai_CayVai_TheoPKVId_ResponseDTO {
  success: boolean;
  message: string;
  data: QM_PhieuKiemVai_CayVai_TheoPKVId[];
}

export class QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO {
  success: boolean;
  message: string;
  data: QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi[];
}
