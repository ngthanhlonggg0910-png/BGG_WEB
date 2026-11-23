import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../guards/auth.guard.js';
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

  @Get('material-tracking/:lsxId')
  async getTheoDoiVatTuLSX(@Param('lsxId') lsxId: string) {
    return this.productionOrderService.getTheoDoiVatTuLSX(Number(lsxId));
  }

  @Post('calculate-bom')
  async tinhNhuCauVatTu(@Body() dto: CalculateBomDto) {
    return this.productionOrderService.tinhNhuCauVatTu(dto);
  }

  // The acting account always comes from the login token, never from the request body.

  @Get('permissions')
  async getQuyenDatHang(@Req() req: AuthenticatedRequest) {
    return this.productionOrderService.getQuyenDatHang(req.user!.tkId);
  }

  @Post('create-material-order')
  async taoDonDatHangVatTu(
    @Body() dto: CreateMaterialOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productionOrderService.taoDonDatHangVatTu(dto, req.user!.tkId);
  }

  @Post('cancel-material-order/:donDatHangId')
  async huyDonDatHangLSX(
    @Param('donDatHangId') donDatHangId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productionOrderService.huyDonDatHangLSX(
      Number(donDatHangId),
      req.user!.tkId,
    );
  }

  @Post('create-picking-order/:donDatHangId')
  async taoPhieuSoanHangTuDonDatHang(
    @Param('donDatHangId') donDatHangId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productionOrderService.taoPhieuSoanHangTuDonDatHang(
      Number(donDatHangId),
      req.user!.tkId,
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
