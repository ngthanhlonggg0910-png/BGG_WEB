import {
  WH_PhieuGiamDinh_GetDanhSachTrangThai,
  wh_DanhSachPhieuGiamDinhTheoThoiGian,
  WH_PhieuGiamDinh_GetData_ByBarcodeKien,
  WH_ChiTietPhieuGiamDinh_PGDId,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile,
  ScannedRolls,
} from '../../domain/entities/mapping-qr.entity.js';

export class WH_PhieuGiamDinh_GetDanhSachTrangThai_ResponseDTO {
  success: boolean;
  message: string;
  data: WH_PhieuGiamDinh_GetDanhSachTrangThai[];
}

export class wh_DanhSachPhieuGiamDinhTheoThoiGian_ResponseDTO {
  success: boolean;
  message: string;
  data: wh_DanhSachPhieuGiamDinhTheoThoiGian[];
}

export class WH_PhieuGiamDinh_GetData_ByBarcodeKien_ResponseDTO {
  success: boolean;
  message: string;
  data: WH_PhieuGiamDinh_GetData_ByBarcodeKien[];
}

export class WH_ChiTietPhieuGiamDinh_PGDId_ResponseDTO {
  success: boolean;
  message: string;
  data: WH_ChiTietPhieuGiamDinh_PGDId[];
}

export class wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_ResponseDTO {
  success: boolean;
  message: string;
  data: wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile;
}

export class getScannedRolls_ResponseDTO {
  success: boolean;
  message: string;
  data: ScannedRolls[];
}

export class updateScannedRoll_ResponseDTO {
  success: boolean;
  message: string;
  rowsAffected: number;
}

export class deleteScannedRoll_ResponseDTO {
  success: boolean;
  message: string;
  rowsAffected: number;
}
