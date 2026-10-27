import * as sql from 'mssql';

import {
  WH_PhieuGiamDinh_GetDanhSachTrangThai,
  wh_DanhSachPhieuGiamDinhTheoThoiGian,
  WH_PhieuGiamDinh_GetData_ByBarcodeKien,
  WH_ChiTietPhieuGiamDinh_PGDId,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile,
  ScannedRolls,
} from '../entities/mapping-qr.entity.js';

export interface IMapingQrRepository {
  getDanhSachTrangThaiPhieuGiamDinh(): Promise<
    WH_PhieuGiamDinh_GetDanhSachTrangThai[]
  >;

  getDanhSachPhieuGiamDinhTheoThoiGian(
    LoaiGiamDinh: string,
    KieuThoiGian: string,
    NgayBatDau: Date,
    NgayKetThuc: Date,
    TrangThai: string,
  ): Promise<wh_DanhSachPhieuGiamDinhTheoThoiGian[]>;

  getDanhSachVatTuTheoBarcodeKien(
    Barcode: string,
  ): Promise<WH_PhieuGiamDinh_GetData_ByBarcodeKien[]>;

  getChiTietPhieuGiamDinh(
    PGDId: number,
  ): Promise<WH_ChiTietPhieuGiamDinh_PGDId[]>;

  saveMapping(
    CTPGDId: number,
    SL: number,
    TKId: number,
    TenNguoiTao: string,
    NguoiTao: number,
    NoiDung: string,
    NguoiThayDoi: string,
    TaiKhoanThayDoi: string,
    MACAddress: string,
    ComputerName: string,
    MaSoKien: string,
    MaKho: string,
    SoMet: number,
    SoYard: number,
    SoGross: number,
    QrTrangMapping: string,
  ): Promise<wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile>;

  getScannedRolls(CTPGDId: number): Promise<ScannedRolls[]>;

  updateScannedRoll(
    SL: number,
    CayId: number,
    CTPGDId: number,
  ): Promise<number>;
}
