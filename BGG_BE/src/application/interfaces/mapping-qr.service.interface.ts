import {
  wh_DanhSachPhieuGiamDinhTheoThoiGian_RequestDTO,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO,
  deleteScannedRoll_RequestDTO,
  splitScannedRoll_RequestDTO,
} from '../dtos/mapping-qr-request.dto.js';

import {
  WH_PhieuGiamDinh_GetDanhSachTrangThai_ResponseDTO,
  wh_DanhSachPhieuGiamDinhTheoThoiGian_ResponseDTO,
  WH_PhieuGiamDinh_GetData_ByBarcodeKien_ResponseDTO,
  WH_ChiTietPhieuGiamDinh_PGDId_ResponseDTO,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_ResponseDTO,
  getScannedRolls_ResponseDTO,
  updateScannedRoll_ResponseDTO,
  splitScannedRoll_ResponseDTO,
  deleteScannedRoll_ResponseDTO,
  getMaterialsByQrTrang_ResponseDTO,
} from '../dtos/mapping-qr-response.dto.js';

export interface IMappingQrService {
  getDanhSachTrangThaiPhieuGiamDinh(): Promise<WH_PhieuGiamDinh_GetDanhSachTrangThai_ResponseDTO>;

  getDanhSachPhieuGiamDinhTheoThoiGian(
    dto: wh_DanhSachPhieuGiamDinhTheoThoiGian_RequestDTO,
  ): Promise<wh_DanhSachPhieuGiamDinhTheoThoiGian_ResponseDTO>;

  getDanhSachVatTuTheoBarcodeKien(
    Barcode: string,
  ): Promise<WH_PhieuGiamDinh_GetData_ByBarcodeKien_ResponseDTO>;

  getChiTietPhieuGiamDinh(
    PGDId: number,
  ): Promise<WH_ChiTietPhieuGiamDinh_PGDId_ResponseDTO>;

  saveMapping(
    dto: wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO,
  ): Promise<wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_ResponseDTO>;

  getScannedRolls(
    CTPGDId: number,
    QrTrangMapping?: string,
  ): Promise<getScannedRolls_ResponseDTO>;

  getMaterialsByQrTrang(
    Barcode: string,
  ): Promise<getMaterialsByQrTrang_ResponseDTO>;

  updateScannedRoll(
    SL: number,
    CayId: number,
    CTPGDId: number,
  ): Promise<updateScannedRoll_ResponseDTO>;

  splitScannedRoll(
    dto: splitScannedRoll_RequestDTO,
  ): Promise<splitScannedRoll_ResponseDTO>;

  deleteScannedRoll(
    dto: deleteScannedRoll_RequestDTO,
  ): Promise<deleteScannedRoll_ResponseDTO>;
}
