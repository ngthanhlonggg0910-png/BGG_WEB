import {
  CalculateBomDto,
  CreateMaterialOrderDto,
  GetProductionOrdersDto,
} from '../dtos/production-order.dto.js';

export interface IProductionOrderService {
  getDanhSachLSX(dto: GetProductionOrdersDto): Promise<any>;
  getChiTietLSX(lsxId: number): Promise<any>;
  tinhNhuCauVatTu(dto: CalculateBomDto): Promise<any>;
  taoDonDatHangVatTu(dto: CreateMaterialOrderDto, tkId: number): Promise<any>;
  getQuyenDatHang(tkId: number): Promise<any>;
  getTheoDoiVatTuLSX(lsxId: number): Promise<any>;
  getDanhSachDonDatHangLSX(params: {
    lsxId?: number;
    loaiDatHang?: string;
    trangThai?: string;
    search?: string;
    tuNgay?: string;
    denNgay?: string;
  }): Promise<any>;
  getChiTietDonDatHangLSX(donDatHangId: number): Promise<any>;
  huyDonDatHangLSX(donDatHangId: number, tkId: number): Promise<any>;
  taoPhieuSoanHangTuDonDatHang(donDatHangId: number, tkId: number): Promise<any>;
}
