import type {
  MaterialAccessoryDefect,
  MaterialInspectionAccessoryDefect,
} from '../../domain/entities/material-inspection.entity.js';

export class wh_chitietphieugiamdinh_capnhat_tilekiem_ResponseDTO {
  success: boolean;
  message: string;
}

export class lib_DSLoi_PhuLieu_ResponseDTO {
  success: boolean;
  message: string;
  data: MaterialAccessoryDefect[];
}

export class WH_ChiTietPhieuGiamDinh_KiemPhuLieu_ResponseDTO {
  success: boolean;
  message: string;
  data: MaterialInspectionAccessoryDefect[];
}

export class WH_ChiTietPhieuGiamDinh_KiemPhuLieu_Delete_ResponseDTO {
  success: boolean;
  message: string;
  rowsAffected: number;
}

export class wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_ResponseDTO {
  success: boolean;
  message: string;
  data: { KetQua: number } | null;
}

export class wh_PhieuGiamDinh_CapNhatTrangThai_ResponseDTO {
  success: boolean;
  message: string;
  data: { KetQua: number } | null;
}

export class wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_ResponseDTO {
  success: boolean;
  message: string;
  data: { KetQua: number } | null;
}
