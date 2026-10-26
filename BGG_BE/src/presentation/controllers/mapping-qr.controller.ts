import { Controller, Get, Inject, Body, Post } from '@nestjs/common';
import type { IMappingQrService } from '../../application/interfaces/mapping-qr.service.interface.js';
import {
  WH_PhieuGiamDinh_GetDanhSachTrangThai_ResponseDTO,
  wh_DanhSachPhieuGiamDinhTheoThoiGian_ResponseDTO,
  WH_PhieuGiamDinh_GetData_ByBarcodeKien_ResponseDTO,
  WH_ChiTietPhieuGiamDinh_PGDId_ResponseDTO,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_ResponseDTO,
} from '../../application/dtos/mapping-qr-response.dto.js';
import {
  wh_DanhSachPhieuGiamDinhTheoThoiGian_RequestDTO,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO,
} from '../../application/dtos/mapping-qr-request.dto.js';
@Controller('mapping-qr')
export class MappingQrController {
  constructor(
    @Inject('IMappingQrService')
    private readonly mappingQrService: IMappingQrService,
  ) {}

  @Get('WH_PhieuGiamDinh_GetDanhSachTrangThai')
  getDanhSachTrangThaiPhieuGiamDinh(): Promise<WH_PhieuGiamDinh_GetDanhSachTrangThai_ResponseDTO> {
    return this.mappingQrService.getDanhSachTrangThaiPhieuGiamDinh();
  }

  @Post('wh_DanhSachPhieuGiamDinhTheoThoiGian')
  getDanhSachPhieuGiamDinhTheoThoiGian(
    @Body() dto: wh_DanhSachPhieuGiamDinhTheoThoiGian_RequestDTO,
  ): Promise<wh_DanhSachPhieuGiamDinhTheoThoiGian_ResponseDTO> {
    return this.mappingQrService.getDanhSachPhieuGiamDinhTheoThoiGian(dto);
  }

  @Post('WH_PhieuGiamDinh_GetData_ByBarcodeKien')
  getDanhSachVatTuTheoBarcodeKien(
    @Body('Barcode') Barcode: string,
  ): Promise<WH_PhieuGiamDinh_GetData_ByBarcodeKien_ResponseDTO> {
    return this.mappingQrService.getDanhSachVatTuTheoBarcodeKien(Barcode);
  }

  @Post('WH_ChiTietPhieuGiamDinh_PGDId')
  getChiTietPhieuGiamDinh(
    @Body('PGDId') PGDId: number,
  ): Promise<WH_ChiTietPhieuGiamDinh_PGDId_ResponseDTO> {
    return this.mappingQrService.getChiTietPhieuGiamDinh(PGDId);
  }

  @Post('wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile')
  saveMapping(
    @Body()
    dto: wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO,
  ): Promise<wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_ResponseDTO> {
    return this.mappingQrService.saveMapping(dto);
  }
}
