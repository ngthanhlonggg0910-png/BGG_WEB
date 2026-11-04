import type {
  wh_chitietphieugiamdinh_capnhat_tilekiem_RequestDTO,
  wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_RequestDTO,
  wh_PhieuGiamDinh_CapNhatTrangThai_RequestDTO,
  wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_RequestDTO,
} from '../dtos/material-inspection-request.dto.js';
import type {
  WH_ChiTietPhieuGiamDinh_KiemPhuLieu_Delete_ResponseDTO,
  WH_ChiTietPhieuGiamDinh_KiemPhuLieu_ResponseDTO,
  wh_chitietphieugiamdinh_capnhat_tilekiem_ResponseDTO,
  wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_ResponseDTO,
  wh_PhieuGiamDinh_CapNhatTrangThai_ResponseDTO,
  wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_ResponseDTO,
} from '../dtos/material-inspection-response.dto.js';
import type { lib_DSLoi_PhuLieu_ResponseDTO } from '../dtos/material-inspection-response.dto.js';

export interface IMaterialInspectionService {
  getAccessoryDefects(): Promise<lib_DSLoi_PhuLieu_ResponseDTO>;

  getDeclaredAccessoryDefects(): Promise<WH_ChiTietPhieuGiamDinh_KiemPhuLieu_ResponseDTO>;

  deleteDeclaredAccessoryDefect(
    id: number,
  ): Promise<WH_ChiTietPhieuGiamDinh_KiemPhuLieu_Delete_ResponseDTO>;

  updateInspectionRate(
    dto: wh_chitietphieugiamdinh_capnhat_tilekiem_RequestDTO,
  ): Promise<wh_chitietphieugiamdinh_capnhat_tilekiem_ResponseDTO>;

  updateHuongXuLy(
    dto: wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_RequestDTO,
  ): Promise<wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_ResponseDTO>;

  updateTrangThai(
    dto: wh_PhieuGiamDinh_CapNhatTrangThai_RequestDTO,
  ): Promise<wh_PhieuGiamDinh_CapNhatTrangThai_ResponseDTO>;

  khaiBaoLoiPhuLieu(
    dto: wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_RequestDTO,
  ): Promise<wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_ResponseDTO>;
}
