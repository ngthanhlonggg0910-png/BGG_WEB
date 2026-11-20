import * as sql from 'mssql';

import {
  WH_PhieuGiamDinh_GetDanhSachTrangThai,
  wh_DanhSachPhieuGiamDinhTheoThoiGian,
  WH_PhieuGiamDinh_GetData_ByBarcodeKien,
  WH_ChiTietPhieuGiamDinh_PGDId,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile,
  ScannedRolls,
} from '../entities/mapping-qr.entity.js';
import {
  splitScannedRoll_RequestDTO,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO,
} from '../../application/dtos/mapping-qr-request.dto.js';

export type SaveMappingBatchResult =
  | { ok: true; rows: wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile[] }
  | {
      ok: false;
      failedIndex: number;
      failedRow: wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile;
    };

export interface UpdateScannedRollResult {
  status: 'updated' | 'not_found' | 'below_exported';
  soLuongXuat: number;
}

export interface DeleteScannedRollResult {
  status: 'deleted' | 'not_found' | 'exported' | 'picked';
  soLuongXuat: number;
}

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

  saveMappingBatch(
    items: wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO[],
  ): Promise<SaveMappingBatchResult>;

  getScannedRolls(
    CTPGDId: number,
    QrTrangMapping?: string,
  ): Promise<ScannedRolls[]>;

  getMaterialsByQrTrang(Barcode: string): Promise<any[]>;

  updateScannedRoll(
    SL: number,
    CayId: number,
    CTPGDId: number,
  ): Promise<UpdateScannedRollResult>;

  splitScannedRoll(dto: splitScannedRoll_RequestDTO): Promise<ScannedRolls[]>;

  deleteScannedRoll(CayId: number, CTPGDId: number): Promise<DeleteScannedRollResult>;
}
