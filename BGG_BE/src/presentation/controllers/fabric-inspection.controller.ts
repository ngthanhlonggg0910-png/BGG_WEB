import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { IFabricInspectionService } from '../../application/interfaces/fabric-inspection.service.interface.js';
import {
  QM_PhieuKiemVai_TheoTKId_RequestDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_RequestDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_RequestDTO,
} from '../../application/dtos/fabric-inspection-request.dto.js';
import {
  QM_PhieuKiemVai_TheoTKId_ResponseDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_ResponseDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO,
} from '../../application/dtos/fabric-inspection-response.dto.js';

@Controller('fabric-inspection')
export class FabricInspectionController {
  constructor(
    @Inject('IFabricInspectionService')
    private readonly fabricInspectionService: IFabricInspectionService,
  ) {}

  @Post('QM_PhieuKiemVai_TheoTKId')
  loadPhieuTheoTKId(
    @Body() dto: QM_PhieuKiemVai_TheoTKId_RequestDTO,
  ): Promise<QM_PhieuKiemVai_TheoTKId_ResponseDTO> {
    return this.fabricInspectionService.loadPhieuTheoTKId(dto);
  }

  @Post('QM_PhieuKiemVai_CayVai_TheoPKVId')
  loadCayVaiTheoPhieuKiem(
    @Body() dto: QM_PhieuKiemVai_CayVai_TheoPKVId_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_TheoPKVId_ResponseDTO> {
    return this.fabricInspectionService.loadCayVaiTheoPhieuKiem(dto);
  }

  @Post('QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi')
  loadDanhSachLoi(
    @Body() dto: QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_RequestDTO,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO> {
    return this.fabricInspectionService.loadDanhSachLoi(dto);
  }
}
