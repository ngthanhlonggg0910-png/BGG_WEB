import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { IPickingOrderService } from '../../application/interfaces/picking-order-service.interface.js';
import {
  wh_DanhSachPhieuSoanHangNgayVaTinhTrang_RequestDTO,
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_RequestDTO,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_RequestDTO,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_RequestDTO,
} from '../../application/dtos/picking-order-request.dto.js';
import {
  wh_DanhSachPhieuSoanHang_TuNgayDenNgay_ResponseDTO,
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_ResponseDTO,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_ResponseDTO,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_ResponseDTO,
} from '../../application/dtos/picking-order-response.dto.js';

@Controller('picking-order')
export class PickingOrderController {
  constructor(
    @Inject('IPickingOrderService')
    public readonly pickingOrderService: IPickingOrderService,
  ) {}

  //Lấy danh sách phiếu soạn hàng theo ngày và tình trạng
  @Post('wh_DanhSachPhieuSoanHangNgayVaTinhTrang')
  async getDanhSachPhieuSoanHangTheoNgayVaTinhTrang(
    @Body() dto: wh_DanhSachPhieuSoanHangNgayVaTinhTrang_RequestDTO,
  ): Promise<wh_DanhSachPhieuSoanHang_TuNgayDenNgay_ResponseDTO> {
    return await this.pickingOrderService.getDanhSachPhieuSoanHangTheoNgayVaTinhTrang(
      dto,
    );
  }

  //Lấy danh sách chi tiết psh theo PhieuSoanHangId
  @Post('wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId')
  async getDanhSachChiTietPhieuSoanHangTheoPhieuSoanHangId(
    @Body() dto: wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_RequestDTO,
  ): Promise<wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_ResponseDTO> {
    return this.pickingOrderService.getDanhSachChiTietPhieuSoanHangTheoPhieuSoanHangId(
      dto,
    );
  }

  //Lấy danh sách vật tư theo mã rọ + psh
  @Post('wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang')
  async getDanhSachVatTuTheoMaRoVaPhieuSoanHang(
    @Body() dto: wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_RequestDTO,
  ): Promise<wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_ResponseDTO> {
    return this.pickingOrderService.getDanhSachVatTuTheoMaRoVaPhieuSoanHang(
      dto,
    );
  }

  //Soạn hàng
  @Post('wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android')
  async wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android(
    @Body()
    dto: wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_RequestDTO,
  ): Promise<wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_ResponseDTO> {
    return this.pickingOrderService.wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android(
      dto,
    );
  }
}
