import { Inject, Injectable } from '@nestjs/common';
import type { IProductionOrderService } from '../interfaces/production-order.service.interface.js';
import type { IProductionOrderRepository } from '../../domain/repositories/production-order.repository.interface.js';
import {
  CalculateBomDto,
  CreateMaterialOrderDto,
  GetProductionOrdersDto,
} from '../dtos/production-order.dto.js';

@Injectable()
export class ProductionOrderService implements IProductionOrderService {
  constructor(
    @Inject('IProductionOrderRepository')
    private readonly productionOrderRepo: IProductionOrderRepository,
  ) {}

  async getDanhSachLSX(dto: GetProductionOrdersDto) {
    const data = await this.productionOrderRepo.getDanhSachLSX(dto);
    return {
      success: true,
      message: 'Lấy danh sách Lệnh sản xuất thành công',
      data,
    };
  }

  async getChiTietLSX(lsxId: number) {
    const data = await this.productionOrderRepo.getChiTietLSX(lsxId);
    return {
      success: true,
      message: 'Lấy chi tiết Lệnh sản xuất thành công',
      data,
    };
  }

  async tinhNhuCauVatTu(dto: CalculateBomDto) {
    const data = await this.productionOrderRepo.tinhNhuCauVatTu(dto);
    return {
      success: true,
      message: 'Tính nhu cầu vật tư theo BOM thành công',
      data,
    };
  }

  async taoDonDatHangVatTu(dto: CreateMaterialOrderDto) {
    const data = await this.productionOrderRepo.taoDonDatHangVatTu(dto);
    return {
      success: true,
      message: `Tạo đơn đặt hàng ${data.soDonDatHang} thành công`,
      data,
    };
  }

  async getDanhSachDonDatHangLSX(params: {
    lsxId?: number;
    loaiDatHang?: string;
    trangThai?: string;
    search?: string;
    tuNgay?: string;
    denNgay?: string;
  }) {
    const data =
      await this.productionOrderRepo.getDanhSachDonDatHangLSX(params);
    return {
      success: true,
      message: 'Lấy danh sách đơn đặt hàng LSX thành công',
      data,
    };
  }

  async getChiTietDonDatHangLSX(donDatHangId: number) {
    const data =
      await this.productionOrderRepo.getChiTietDonDatHangLSX(donDatHangId);
    return {
      success: true,
      message: 'Lấy chi tiết đơn đặt hàng LSX thành công',
      data,
    };
  }

  async huyDonDatHangLSX(donDatHangId: number, nguoiHuy?: string) {
    const data = await this.productionOrderRepo.huyDonDatHangLSX(
      donDatHangId,
      nguoiHuy,
    );
    return {
      success: true,
      message: `Đã hủy đơn đặt hàng [${data.soDonDatHang}] thành công`,
      data,
    };
  }

  async taoPhieuSoanHangTuDonDatHang(
    donDatHangId: number,
    tkId?: number,
    nguoiTao?: string,
  ) {
    const data = await this.productionOrderRepo.taoPhieuSoanHangTuDonDatHang(
      donDatHangId,
      tkId,
      nguoiTao,
    );
    return {
      success: true,
      message: `Đã tạo Phiếu soạn hàng [${data.maSoPhieuSoan}] thành công`,
      data,
    };
  }
}
