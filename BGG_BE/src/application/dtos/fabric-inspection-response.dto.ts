import {
  QM_PhieuKiemVai_TheoTKId,
  QM_PhieuKiemVai_CayVai_TheoPKVId,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi,
  QM_DoKhoVai,
  QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile,
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

export class QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_ResponseDTO {
  success: boolean;
  message: string;
}

export class QM_DoKhoVai_ThemMoi_ResponseDTO {
  success: boolean;
  message: string;
}

//Lấy kết quả đo
export class QM_DoKhoVai_ResponseDTO {
  success: boolean;
  message: string;
  data: QM_DoKhoVai[];
}

export class QM_PhieuKiemVai_CayVai_CapNhatGhiChu_ResponseDTO {
  success: boolean;
  message: string;
}

export class QM_PhieuKiemVai_CayVai_Delete_ResponseDTO {
  success: boolean;
  message: string;
}

export class QM_PhieuKiemVai_CayVai_XongCay_Android_ResponseDTO {
  success: boolean;
  message: string;
}

export class QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_ResponseDTO {
  success: boolean;
  message: string;
  data: QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile;
}

export class QM_PhieuKiemVai_TaoPhieuKiem_ResponseDTO {
  success: boolean;
  message: string;
  data: { SoPhieuKiem: string };
}
