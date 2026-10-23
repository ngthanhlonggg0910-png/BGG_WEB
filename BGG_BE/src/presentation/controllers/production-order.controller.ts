import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { IProductionOrderService } from '../../application/interfaces/production-order.service.interface.js';
import {
  CalculateBomDto,
  CancelMaterialOrderDto,
  CreateMaterialOrderDto,
  CreatePickingOrderDto,
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

  @Post('cancel-material-order/:donDatHangId')
  async huyDonDatHangLSX(
    @Param('donDatHangId') donDatHangId: string,
    @Body() dto?: CancelMaterialOrderDto,
  ) {
    return this.productionOrderService.huyDonDatHangLSX(
      Number(donDatHangId),
      dto?.nguoiHuy,
    );
  }

  @Post('create-picking-order/:donDatHangId')
  async taoPhieuSoanHangTuDonDatHang(
    @Param('donDatHangId') donDatHangId: string,
    @Body() dto?: CreatePickingOrderDto,
  ) {
    return this.productionOrderService.taoPhieuSoanHangTuDonDatHang(
      Number(donDatHangId),
      dto?.tkId,
      dto?.nguoiTao,
    );
  }

  @Get('material-orders')
  async getDanhSachDonDatHangLSX(
    @Query('lsxId') lsxId?: string,
    @Query('loaiDatHang') loaiDatHang?: string,
    @Query('trangThai') trangThai?: string,
    @Query('search') search?: string,
    @Query('tuNgay') tuNgay?: string,
    @Query('denNgay') denNgay?: string,
  ) {
    return this.productionOrderService.getDanhSachDonDatHangLSX({
      lsxId: lsxId ? Number(lsxId) : undefined,
      loaiDatHang,
      trangThai,
      search,
      tuNgay,
      denNgay,
    });
  }

  @Get('material-order-detail/:donDatHangId')
  async getChiTietDonDatHangLSX(@Param('donDatHangId') donDatHangId: string) {
    return this.productionOrderService.getChiTietDonDatHangLSX(
      Number(donDatHangId),
    );
  }
}
