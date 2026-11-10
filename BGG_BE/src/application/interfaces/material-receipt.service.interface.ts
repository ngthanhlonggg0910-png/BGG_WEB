import {
  wh_DanhSachDonNhanHang_RequestDTO,
  wh_ChiTietDonNhanHang_RequestDTO,
  wh_QuetNhanCay_RequestDTO,
  wh_XacNhanNhanHang_RequestDTO,
  wh_XacNhanNhanThungGPA_RequestDTO,
} from '../dtos/material-receipt-request.dto.js';
import {
  wh_DanhSachDonNhanHang_ResponseDTO,
  wh_ChiTietDonNhanHang_ResponseDTO,
  wh_QuetNhanCay_ResponseDTO,
  wh_XacNhanNhanHang_ResponseDTO,
  wh_XacNhanNhanThungGPA_ResponseDTO,
} from '../dtos/material-receipt-response.dto.js';

export interface IMaterialReceiptService {
  getDanhSachDonNhanHang(
    dto: wh_DanhSachDonNhanHang_RequestDTO,
  ): Promise<wh_DanhSachDonNhanHang_ResponseDTO>;

  getChiTietDonNhanHang(
    dto: wh_ChiTietDonNhanHang_RequestDTO,
  ): Promise<wh_ChiTietDonNhanHang_ResponseDTO>;

  quetNhanCay(
    dto: wh_QuetNhanCay_RequestDTO,
  ): Promise<wh_QuetNhanCay_ResponseDTO>;

  xacNhanNhanHang(
    dto: wh_XacNhanNhanHang_RequestDTO,
  ): Promise<wh_XacNhanNhanHang_ResponseDTO>;

  xacNhanNhanThungGPA(
    dto: wh_XacNhanNhanThungGPA_RequestDTO,
  ): Promise<wh_XacNhanNhanThungGPA_ResponseDTO>;
}
