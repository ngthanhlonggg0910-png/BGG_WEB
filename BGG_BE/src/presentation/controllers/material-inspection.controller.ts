import {
  Body,
  Controller,
  Get,
  Inject,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import type {
  wh_chitietphieugiamdinh_capnhat_tilekiem_RequestDTO,
  wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_RequestDTO,
  wh_PhieuGiamDinh_CapNhatTrangThai_RequestDTO,
  wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_RequestDTO,
} from '../../application/dtos/material-inspection-request.dto.js';
import type {
  WH_ChiTietPhieuGiamDinh_KiemPhuLieu_Delete_ResponseDTO,
  WH_ChiTietPhieuGiamDinh_KiemPhuLieu_ResponseDTO,
  wh_chitietphieugiamdinh_capnhat_tilekiem_ResponseDTO,
  wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_ResponseDTO,
  wh_PhieuGiamDinh_CapNhatTrangThai_ResponseDTO,
  wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_ResponseDTO,
} from '../../application/dtos/material-inspection-response.dto.js';
import type { lib_DSLoi_PhuLieu_ResponseDTO } from '../../application/dtos/material-inspection-response.dto.js';
import type { IMaterialInspectionService } from '../../application/interfaces/material-inspection.service.interface.js';

@Controller('material-inspection')
export class MaterialInspectionController {
  constructor(
    @Inject('IMaterialInspectionService')
    private readonly materialInspectionService: IMaterialInspectionService,
  ) {}

  @Post('lib_DSLoi_PhuLieu')
  getAccessoryDefects(): Promise<lib_DSLoi_PhuLieu_ResponseDTO> {
    return this.materialInspectionService.getAccessoryDefects();
  }

  @Get('WH_ChiTietPhieuGiamDinh_KiemPhuLieu')
  getDeclaredAccessoryDefects(): Promise<WH_ChiTietPhieuGiamDinh_KiemPhuLieu_ResponseDTO> {
    return this.materialInspectionService.getDeclaredAccessoryDefects();
  }

  @Post('WH_ChiTietPhieuGiamDinh_KiemPhuLieu_Delete')
  deleteDeclaredAccessoryDefect(
    @Body('Id', ParseIntPipe) id: number,
  ): Promise<WH_ChiTietPhieuGiamDinh_KiemPhuLieu_Delete_ResponseDTO> {
    return this.materialInspectionService.deleteDeclaredAccessoryDefect(id);
  }

  @Post('wh_chitietphieugiamdinh_capnhat_tilekiem')
  updateInspectionRate(
    @Body() dto: wh_chitietphieugiamdinh_capnhat_tilekiem_RequestDTO,
  ): Promise<wh_chitietphieugiamdinh_capnhat_tilekiem_ResponseDTO> {
    return this.materialInspectionService.updateInspectionRate(dto);
  }

  @Post('wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile')
  updateHuongXuLy(
    @Body() dto: wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_RequestDTO,
  ): Promise<wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_ResponseDTO> {
    return this.materialInspectionService.updateHuongXuLy(dto);
  }

  @Post('wh_PhieuGiamDinh_CapNhatTrangThai')
  updateTrangThai(
    @Body() dto: wh_PhieuGiamDinh_CapNhatTrangThai_RequestDTO,
  ): Promise<wh_PhieuGiamDinh_CapNhatTrangThai_ResponseDTO> {
    return this.materialInspectionService.updateTrangThai(dto);
  }

  @Post('wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile')
  khaiBaoLoiPhuLieu(
    @Body() dto: wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_RequestDTO,
  ): Promise<wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_ResponseDTO> {
    return this.materialInspectionService.khaiBaoLoiPhuLieu(dto);
  }
}
