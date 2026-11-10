import {
  MaterialReceiptOrderEntity,
  MaterialReceiptItemEntity,
  MaterialReceiptRollEntity,
  MaterialReceiptThungEntity,
} from '../../domain/entities/material-receipt.entity.js';

export class wh_DanhSachDonNhanHang_ResponseDTO {
  success: boolean;
  message?: string;
  data: MaterialReceiptOrderEntity[];
  total: number;
}

export class wh_ChiTietDonNhanHang_ResponseDTO {
  success: boolean;
  message?: string;
  header: MaterialReceiptOrderEntity;
  items: MaterialReceiptItemEntity[];
  thungs?: MaterialReceiptThungEntity[];
}

export class wh_QuetNhanCay_ResponseDTO {
  success: boolean;
  message: string;
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
}

export class wh_XacNhanNhanHang_ResponseDTO {
  success: boolean;
  message: string;
  summary: {
    PhieuSoanHangId: number;
    TongSoCay: number;
    SoCayDaNhan: number;
    TongSoLuongXuat: number;
    SoLuongDaNhan: number;
    TrangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu';
    isHoanThanh: boolean;
    soCayVuaCapNhat: number;
  };
}

export class wh_XacNhanNhanThungGPA_ResponseDTO {
  success: boolean;
  message: string;
  summary: {
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
  };
}
