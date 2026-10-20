import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { IWarehouseService } from '../../application/interfaces/warehouse-service.interface.js';
import {
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
  lib_Ro_CapNhatViTri_New_RequestDTO,
  Lib_RO_TimTheoKho_ViTri_RequestDTO,
  lib_Ro_DanhSachCayTheoKID_MaRo_TKId_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_RequestDTO,
} from '../../application/dtos/warehouse-request.dto.js';

import {
  lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO,
  lib_Ro_CapNhatViTri_New_ResponseDTO,
  Lib_RO_TimTheoKho_ViTri_ResponseDTO,
  lib_Ro_DanhSachCayTheoKID_MaRo_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_ResponseDTO,
} from '../../application/dtos/warehouse-response.js';

@Controller('warehouse')
export class WarehouseController {
  constructor(
    @Inject('IWarehouseService')
    private readonly warehouseService: IWarehouseService,
  ) {}

  //Lấy danh sách kho
  @Post('lib_DanhSachDanhSachKho_TheoTKId')
  getDanhSachKhoTheoTKId(
    @Body('TKId') TKId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO> {
    return this.warehouseService.getDanhSachKhoTheoTKId(TKId);
  }

  //Tìm theo mã rọ
  @Post('lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId')
  TimTheoMaRo(
    @Body() dto: lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO> {
    return this.warehouseService.TimTheoMaRo(dto);
  }

  //Lấy danh sách tìm kiếm theo KId, MaViTri, TKId
  @Post('lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode')
  TimTheoViTri(
    @Body() dto: lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO> {
    return this.warehouseService.TimTheoViTri(dto);
  }

  //TÌm theo mã hàng
  @Post('lib_Ro_DanhSachTheoKID_MaHang')
  TimTheoMaHang(
    @Body() dto: lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO> {
    return this.warehouseService.TimTheoMaHang(dto);
  }

  //Tìm theo vật tư
  @Post('lib_Ro_DanhSachTheoKID_MaCay_TKId')
  TimTheoVatTu(
    @Body() dto: lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO> {
    return this.warehouseService.TimTheoVatTu(dto);
  }

  @Post('lib_Ro_CapNhatViTri_New')
  updateBasketLocation(
    @Body() dto: lib_Ro_CapNhatViTri_New_RequestDTO,
  ): Promise<lib_Ro_CapNhatViTri_New_ResponseDTO> {
    return this.warehouseService.updateBasketLocation(dto);
  }

  //Lấy danh sách Rọ theo Kho
  @Post('Lib_RO_TimTheoKho_ViTri')
  layDanhSachRoTheoKho(
    @Body() dto: Lib_RO_TimTheoKho_ViTri_RequestDTO,
  ): Promise<Lib_RO_TimTheoKho_ViTri_ResponseDTO> {
    return this.warehouseService.layDanhSachRoTheoKho(dto);
  }

  //Lấy danh sách cây vải trong rổ theo TKID + KID
  @Post('lib_Ro_DanhSachCayTheoKID_MaRo_TKId')
  layDanhSachCayVaiTrongRo(
    @Body() dto: lib_Ro_DanhSachCayTheoKID_MaRo_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachCayTheoKID_MaRo_TKId_ResponseDTO> {
    return this.warehouseService.layDanhSachCayVaiTrongRo(dto);
  }

  //Lấy danh sách cây vải trong rọ theo điều kiện
  @Post('lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId')
  layDanhSachCayVaiTheoDieuKien(
    @Body() dto: lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_ResponseDTO> {
    return this.warehouseService.layDanhSachCayVaiTheoDieuKien(dto);
  }
}
