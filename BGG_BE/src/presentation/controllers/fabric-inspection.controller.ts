import { Body, Controller, Inject, ParseIntPipe, Post } from '@nestjs/common';
import type { IFabricInspectionService } from '../../application/interfaces/fabric-inspection.service.interface.js';
import {
  QM_PhieuKiemVai_TheoTKId_RequestDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_RequestDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_RequestDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_RequestDTO,
  QM_DoKhoVai_ThemMoi_RequestDTO,
  QM_PhieuKiemVai_CayVai_CapNhatGhiChu_RequestDTO,
  QM_PhieuKiemVai_CayVai_Delete_RequestDTO,
  QM_PhieuKiemVai_CayVai_XongCay_Android_RequestDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_RequestDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_RequestDTO,
} from '../../application/dtos/fabric-inspection-request.dto.js';
import {
  QM_PhieuKiemVai_TheoTKId_ResponseDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_ResponseDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_ResponseDTO,
  QM_DoKhoVai_ThemMoi_ResponseDTO,
  QM_DoKhoVai_ResponseDTO,
  QM_PhieuKiemVai_CayVai_CapNhatGhiChu_ResponseDTO,
  QM_PhieuKiemVai_CayVai_Delete_ResponseDTO,
  QM_PhieuKiemVai_CayVai_XongCay_Android_ResponseDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_ResponseDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_ResponseDTO,
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

  @Post('QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi')
  themLoiCayVai(
    @Body() dto: QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_RequestDTO,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_ResponseDTO> {
    return this.fabricInspectionService.themLoiCayVai(dto);
  }

  @Post('QM_DoKhoVai_ThemMoi')
  doKho(
    @Body() dto: QM_DoKhoVai_ThemMoi_RequestDTO,
  ): Promise<QM_DoKhoVai_ThemMoi_ResponseDTO> {
    return this.fabricInspectionService.doKho(dto);
  }

  @Post('QM_DoKhoVai')
  layKetQuaDo(
    @Body('CTId', ParseIntPipe) CTId: number,
  ): Promise<QM_DoKhoVai_ResponseDTO> {
    return this.fabricInspectionService.layKetQuaDo(CTId);
  }

  @Post('QM_PhieuKiemVai_CayVai_CapNhatGhiChu')
  capNhatGhiChuHuongXuLyCayVai(
    @Body() dto: QM_PhieuKiemVai_CayVai_CapNhatGhiChu_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_CapNhatGhiChu_ResponseDTO> {
    return this.fabricInspectionService.capNhatGhiChuHuongXuLyCayVai(dto);
  }

  @Post('QM_PhieuKiemVai_CayVai_Delete')
  xoaCayVai(
    @Body() dto: QM_PhieuKiemVai_CayVai_Delete_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_Delete_ResponseDTO> {
    return this.fabricInspectionService.xoaCayVai(dto);
  }

  @Post('QM_PhieuKiemVai_CayVai_XongCay_Android')
  xongCayVai(
    @Body() dto: QM_PhieuKiemVai_CayVai_XongCay_Android_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_XongCay_Android_ResponseDTO> {
    return this.fabricInspectionService.xongCayVai(dto);
  }

  @Post('QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile')
  taoPhieuKiemVaiAuto(
    @Body() dto: QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_RequestDTO,
  ): Promise<QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_ResponseDTO> {
    return this.fabricInspectionService.taoPhieuKiemVaiAuto(dto);
  }

  @Post('QM_PhieuKiemVai_TaoPhieuKiem')
  taoPhieuKiemThuCong(
    @Body() dto: QM_PhieuKiemVai_TaoPhieuKiem_RequestDTO,
  ): Promise<QM_PhieuKiemVai_TaoPhieuKiem_ResponseDTO> {
    return this.fabricInspectionService.taoPhieuKiemThuCong(dto);
  }
}
