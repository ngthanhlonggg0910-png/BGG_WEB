import {
  CalculateBomDto,
  CreateMaterialOrderDto,
  GetProductionOrdersDto,
} from '../../application/dtos/production-order.dto.js';

export interface IProductionOrderRepository {
  getDanhSachLSX(dto: GetProductionOrdersDto): Promise<any[]>;
  getChiTietLSX(lsxId: number): Promise<any>;
  tinhNhuCauVatTu(dto: CalculateBomDto): Promise<any[]>;
  taoDonDatHangVatTu(dto: CreateMaterialOrderDto): Promise<any>;
  getDanhSachDonDatHangLSX(params: {
    lsxId?: number;
    loaiDatHang?: string;
    trangThai?: string;
  }): Promise<any[]>;
  getChiTietDonDatHangLSX(donDatHangId: number): Promise<any>;
}
