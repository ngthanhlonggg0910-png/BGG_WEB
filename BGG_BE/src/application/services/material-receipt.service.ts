import { Inject, Injectable } from '@nestjs/common';
import { IMaterialReceiptService } from '../interfaces/material-receipt.service.interface.js';
import type { IMaterialReceiptRepository } from '../../domain/repositories/material-receipt.repository.interface.js';
import {
  wh_DanhSachDonNhanHang_RequestDTO,
  wh_ChiTietDonNhanHang_RequestDTO,
  wh_QuetNhanCay_RequestDTO,
  wh_XacNhanNhanHang_RequestDTO,
} from '../dtos/material-receipt-request.dto.js';
import {
  wh_DanhSachDonNhanHang_ResponseDTO,
  wh_ChiTietDonNhanHang_ResponseDTO,
  wh_QuetNhanCay_ResponseDTO,
  wh_XacNhanNhanHang_ResponseDTO,
} from '../dtos/material-receipt-response.dto.js';

@Injectable()
export class MaterialReceiptService implements IMaterialReceiptService {
  constructor(
    @Inject('IMaterialReceiptRepository')
    private readonly materialReceiptRepository: IMaterialReceiptRepository,
  ) {}

  async getDanhSachDonNhanHang(
    dto: wh_DanhSachDonNhanHang_RequestDTO,
  ): Promise<wh_DanhSachDonNhanHang_ResponseDTO> {
    const list =
      await this.materialReceiptRepository.getDanhSachDonNhanHang(dto);
    return {
      success: true,
      data: list,
      total: list.length,
    };
  }

  async getChiTietDonNhanHang(
    dto: wh_ChiTietDonNhanHang_RequestDTO,
  ): Promise<wh_ChiTietDonNhanHang_ResponseDTO> {
    const { header, items } =
      await this.materialReceiptRepository.getChiTietDonNhanHang(
        dto.PhieuSoanHangId,
        dto.DonDatHangId,
      );
    return {
      success: true,
      header,
      items,
    };
  }

  async quetNhanCay(
    dto: wh_QuetNhanCay_RequestDTO,
  ): Promise<wh_QuetNhanCay_ResponseDTO> {
    const result = await this.materialReceiptRepository.quetNhanCay(dto);
    const msg =
      dto.action === 'huy_nhan'
        ? `Đã hủy nhận cây [${result.cay.MaCay}]!`
        : `Đã nhận thành công cây [${result.cay.MaCay}] (${result.cay.SoLuongThucNhan || result.cay.SoLuongXuat})!`;
    return {
      success: true,
      message: msg,
      cay: result.cay,
      summary: result.summary,
    };
  }

  async xacNhanNhanHang(
    dto: wh_XacNhanNhanHang_RequestDTO,
  ): Promise<wh_XacNhanNhanHang_ResponseDTO> {
    const summary = await this.materialReceiptRepository.xacNhanNhanHang(dto);
    const msg = dto.nhanTatCa
      ? `Đã xác nhận nhận tất cả (${summary.soCayVuaCapNhat} cây mới)!`
      : `Đã lưu trạng thái nhận hàng!`;
    return {
      success: true,
      message: msg,
      summary,
    };
  }
}
