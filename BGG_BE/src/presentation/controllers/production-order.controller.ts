import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import type { IProductionOrderService } from '../../application/interfaces/production-order.service.interface.js';
import {
  CalculateBomDto,
  CreateMaterialOrderDto,
  GetProductionOrdersDto,
} from '../../application/dtos/production-order.dto.js';

@Controller('production-order')
export class ProductionOrderController {
  constructor(
    @Inject('IProductionOrderService')
    private readonly productionOrderService: IProductionOrderService,
  ) {}

  @Post('list')
  async getDanhSachLSX(@Body() dto: GetProductionOrdersDto) {
    return this.productionOrderService.getDanhSachLSX(dto);
  }

  @Get('detail/:lsxId')
  async getChiTietLSX(@Param('lsxId') lsxId: string) {
    return this.productionOrderService.getChiTietLSX(Number(lsxId));
  }

  @Post('calculate-bom')
  async tinhNhuCauVatTu(@Body() dto: CalculateBomDto) {
    return this.productionOrderService.tinhNhuCauVatTu(dto);
  }

  @Post('create-material-order')
  async taoDonDatHangVatTu(@Body() dto: CreateMaterialOrderDto) {
    return this.productionOrderService.taoDonDatHangVatTu(dto);
  }

  @Get('material-orders')
  async getDanhSachDonDatHangLSX(
    @Query('lsxId') lsxId?: string,
    @Query('loaiDatHang') loaiDatHang?: string,
    @Query('trangThai') trangThai?: string,
  ) {
    return this.productionOrderService.getDanhSachDonDatHangLSX({
      lsxId: lsxId ? Number(lsxId) : undefined,
      loaiDatHang,
      trangThai,
    });
  }

  @Get('material-order-detail/:donDatHangId')
  async getChiTietDonDatHangLSX(@Param('donDatHangId') donDatHangId: string) {
    return this.productionOrderService.getChiTietDonDatHangLSX(
      Number(donDatHangId),
    );
  }
}
