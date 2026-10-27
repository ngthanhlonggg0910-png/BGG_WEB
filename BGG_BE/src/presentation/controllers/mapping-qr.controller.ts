import {
  Controller,
  Get,
  Inject,
  Body,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import type { IMappingQrService } from '../../application/interfaces/mapping-qr.service.interface.js';
import {
  WH_PhieuGiamDinh_GetDanhSachTrangThai_ResponseDTO,
  wh_DanhSachPhieuGiamDinhTheoThoiGian_ResponseDTO,
  WH_PhieuGiamDinh_GetData_ByBarcodeKien_ResponseDTO,
  WH_ChiTietPhieuGiamDinh_PGDId_ResponseDTO,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_ResponseDTO,
  getScannedRolls_ResponseDTO,
  updateScannedRoll_ResponseDTO,
  deleteScannedRoll_ResponseDTO,
} from '../../application/dtos/mapping-qr-response.dto.js';
import {
  updateScannedRoll_RequestDTO,
  wh_DanhSachPhieuGiamDinhTheoThoiGian_RequestDTO,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO,
  deleteScannedRoll_RequestDTO,
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

  @Post('getScannedRolls')
  getScannedRolls(
    @Body('CTPGDId', ParseIntPipe) CTPGDId: number,
  ): Promise<getScannedRolls_ResponseDTO> {
    return this.mappingQrService.getScannedRolls(CTPGDId);
  }

  @Post('updateScannedRoll')
  async updateScannedRoll(
    @Body() dto: updateScannedRoll_RequestDTO,
  ): Promise<updateScannedRoll_ResponseDTO> {
    return this.mappingQrService.updateScannedRoll(
      dto.SL,
      dto.CayId,
      dto.CTPGDId,
    );
  }

  @Post('deleteScannedRoll')
  deleteScannedRoll(
    @Body() dto: deleteScannedRoll_RequestDTO,
  ): Promise<deleteScannedRoll_ResponseDTO> {
    return this.mappingQrService.deleteScannedRoll(dto);
  }
}
