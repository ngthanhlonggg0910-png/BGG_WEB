import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { IBasketLocationService } from '../../application/interfaces/basket.interface.js';
import {
  BasketFabricRollDetailRequestDTO,
  BasketFabricRollRequestDTO,
  BasketFindLocationRequestDTO,
  BasketLocationRequestDTO,
} from '../../application/dtos/basket-request.dto.js';
import {
  BaskedLocationResponseDTO,
  BasketFabricRollResponseDTO,
  BasketFindLocationResponseDTO,
} from '../../application/dtos/basket-response.dto.js';

@Controller('basketlocation')
export class BasketLocationController {
  constructor(
    @Inject('IBasketLocationService')
    private readonly basketLocationService: IBasketLocationService,
  ) {}

  @Post('lib_Ro_CapNhatViTri_New')
  async lib_Ro_CapNhatViTri_New(
    @Body() dto: BasketLocationRequestDTO,
  ): Promise<BaskedLocationResponseDTO> {
    return await this.basketLocationService.updateLocation(dto);
  }

  @Post('Lib_RO_TimTheoKho_ViTri')
  async Lib_RO_TimTheoKho_ViTri(
    @Body() dto: BasketFindLocationRequestDTO,
  ): Promise<BasketFindLocationResponseDTO> {
    return await this.basketLocationService.getBasketsByWarehouseLocation(dto);
  }

  @Post('lib_Ro_DanhSachCayTheoKID_MaRo_TKId')
  async lib_Ro_DanhSachCayTheoKID_MaRo_TKId(
    @Body() dto: BasketFabricRollRequestDTO,
  ): Promise<BasketFabricRollResponseDTO> {
    return await this.basketLocationService.getBasketFabricRoll(dto);
  }

  @Post('lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId')
  async lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId(
    @Body() dto: BasketFabricRollDetailRequestDTO,
  ) {
    return this.basketLocationService.getFabricRollsByRo(dto);
  }
}
