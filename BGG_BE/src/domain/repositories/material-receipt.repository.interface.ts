import {
  MaterialReceiptOrderEntity,
  MaterialReceiptItemEntity,
  MaterialReceiptRollEntity,
  MaterialReceiptThungEntity,
} from '../entities/material-receipt.entity.js';
import {
  wh_DanhSachDonNhanHang_RequestDTO,
  wh_QuetNhanCay_RequestDTO,
  wh_XacNhanNhanHang_RequestDTO,
  wh_XacNhanNhanThungGPA_RequestDTO,
} from '../../application/dtos/material-receipt-request.dto.js';

export interface IMaterialReceiptRepository {
  getDanhSachDonNhanHang(
    dto: wh_DanhSachDonNhanHang_RequestDTO,
  ): Promise<MaterialReceiptOrderEntity[]>;

  getChiTietDonNhanHang(
    phieuSoanHangId: number,
    donDatHangId?: number,
  ): Promise<{
    header: MaterialReceiptOrderEntity;
    items: MaterialReceiptItemEntity[];
    thungs?: MaterialReceiptThungEntity[];
  }>;

  quetNhanCay(dto: wh_QuetNhanCay_RequestDTO): Promise<{
    cay: MaterialReceiptRollEntity;
    summary: {
      TongSoCay: number;
      SoCayDaNhan: number;
      TongSoLuongXuat: number;
      SoLuongDaNhan: number;
      TrangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu';
      TiLeNhan: number;
      isHoanThanh: boolean;
    };
  }>;

  xacNhanNhanHang(dto: wh_XacNhanNhanHang_RequestDTO): Promise<{
    PhieuSoanHangId: number;
    TongSoCay: number;
    SoCayDaNhan: number;
    TongSoLuongXuat: number;
    SoLuongDaNhan: number;
    TrangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu';
    isHoanThanh: boolean;
    soCayVuaCapNhat: number;
  }>;

  xacNhanNhanThungGPA(dto: wh_XacNhanNhanThungGPA_RequestDTO): Promise<{
    PhieuSoanHangId: number;
    MaGPA: string;
    TongSoCay: number;
    SoCayDaNhan: number;
    TongSoLuongXuat: number;
    SoLuongDaNhan: number;
    TrangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu';
    isHoanThanh: boolean;
    soCayVuaCapNhat: number;
    thungSummary?: {
      MaGPA: string;
      TongSoCay: number;
      SoCayDaNhan: number;
      TrangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu';
    };
  }>;
}
