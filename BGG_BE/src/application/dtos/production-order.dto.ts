export class GetProductionOrdersDto {
  tuNgay?: string;
  denNgay?: string;
  trangThai?: string;
  search?: string;
}

export class SelectedLsxRowDto {
  chiTietLsxId?: number;
  poId: number;
  poNo?: string;
  tenMau?: string;
  codeMau?: string;
  tenSize?: string;
  soLuongSanPham: number;
}

export class CalculateBomDto {
  lsxId: number;
  loaiDatHang: 'ALL' | 'NguyenLieu' | 'PhuLieu';
  ghiChuLot?: string;
  selectedRows: SelectedLsxRowDto[];
}

export class MaterialOrderItemDto {
  vtId?: number | null;
  maVatTu: string;
  tenVatTu: string;
  dvt?: string;
  loaiNPL?: string;
  dinhMuc: number;
  soLuongSanPham: number;
  soLuongYeuCau: number;
  ghiChu?: string;
  ghiChuLot?: string;
}

export class CreateMaterialOrderDto {
  lsxId: number;
  loaiDatHang: 'ALL' | 'NguyenLieu' | 'PhuLieu';
  nguoiDat: string;
  tkId: number;
  ngayCanGiao?: string;
  ghiChuLot?: string;
  ghiChu?: string;
  items: MaterialOrderItemDto[];
}

export class CancelMaterialOrderDto {
  nguoiHuy?: string;
  tkId?: number;
}

export class CreatePickingOrderDto {
  tkId?: number;
  nguoiTao?: string;
}
