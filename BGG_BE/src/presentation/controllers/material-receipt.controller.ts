import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { IMaterialReceiptService } from '../../application/interfaces/material-receipt.service.interface.js';
import {
  wh_DanhSachDonNhanHang_RequestDTO,
  wh_ChiTietDonNhanHang_RequestDTO,
  wh_QuetNhanCay_RequestDTO,
  wh_XacNhanNhanHang_RequestDTO,
} from '../../application/dtos/material-receipt-request.dto.js';
import {
  wh_DanhSachDonNhanHang_ResponseDTO,
  wh_ChiTietDonNhanHang_ResponseDTO,
  wh_QuetNhanCay_ResponseDTO,
  wh_XacNhanNhanHang_ResponseDTO,
} from '../../application/dtos/material-receipt-response.dto.js';

@Controller('material-receipt')
export class MaterialReceiptController {
  constructor(
    @Inject('IMaterialReceiptService')
    private readonly materialReceiptService: IMaterialReceiptService,
  ) {}

  // Lấy danh sách đơn nhận hàng (Nguyên liệu / Phụ liệu)
  @Post('wh_DanhSachDonNhanHang')
  async getDanhSachDonNhanHang(
    @Body() dto: wh_DanhSachDonNhanHang_RequestDTO,
  ): Promise<wh_DanhSachDonNhanHang_ResponseDTO> {
    return this.materialReceiptService.getDanhSachDonNhanHang(dto);
  }

  // Lấy chi tiết đơn nhận hàng kèm danh sách cây/vật tư
  @Post('wh_ChiTietDonNhanHang')
  async getChiTietDonNhanHang(
    @Body() dto: wh_ChiTietDonNhanHang_RequestDTO,
  ): Promise<wh_ChiTietDonNhanHang_ResponseDTO> {
    return this.materialReceiptService.getChiTietDonNhanHang(dto);
  }

  // Quét nhận từng cây hoặc hủy nhận
  @Post('wh_QuetNhanCay')
  async quetNhanCay(
    @Body() dto: wh_QuetNhanCay_RequestDTO,
  ): Promise<wh_QuetNhanCay_ResponseDTO> {
    return this.materialReceiptService.quetNhanCay(dto);
  }

  // Xác nhận nhận tất cả hoặc chốt hoàn tất nhận hàng
  @Post('wh_XacNhanNhanHang')
  async xacNhanNhanHang(
    @Body() dto: wh_XacNhanNhanHang_RequestDTO,
  ): Promise<wh_XacNhanNhanHang_ResponseDTO> {
    return this.materialReceiptService.xacNhanNhanHang(dto);
  }
}
