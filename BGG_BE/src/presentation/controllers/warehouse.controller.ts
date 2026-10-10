import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { IWarehouseService } from '../../application/interfaces/warehouse-service.interface.js';
import {
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
} from '../../application/dtos/warehouse-request.dto.js';

import {
  lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO,
} from '../../application/dtos/warehouse-response.js';

@Controller('warehouse')
export class WarehouseController {
  constructor(
    @Inject('IWarehouseService')
    private readonly warehouseService: IWarehouseService,
  ) {}

  @Post('lib_DanhSachDanhSachKho_TheoTKId')
  lib_DanhSachDanhSachKho_TheoTKId(
    @Body('TKId') TKId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO> {
    return this.warehouseService.getWarehousesByAccountId(TKId);
  }

  @Post('lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId')
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId(
    @Body() dto: lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO> {
    return this.warehouseService.searchByMaRo(dto);
  }

  //Lấy danh sách tìm kiếm theo KId, MaViTri, TKId
  @Post('lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode')
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode(
    @Body() dto: lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO> {
    return this.warehouseService.searchByPosition(dto);
  }

  //TÌm theo mã hàng
  @Post('lib_Ro_DanhSachTheoKID_MaHang')
  lib_Ro_DanhSachTheoKID_MaHang(
    @Body() dto: lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO> {
    return this.warehouseService.searchByItemCode(dto);
  }

  //Tìm theo vật tư
  @Post('lib_Ro_DanhSachTheoKID_MaCay_TKId')
  async lib_Ro_DanhSachTheoKID_MaCay_TKId(
    @Body() dto: lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO> {
    return await this.warehouseService.searchMaterialLocations(dto);
  }
}
