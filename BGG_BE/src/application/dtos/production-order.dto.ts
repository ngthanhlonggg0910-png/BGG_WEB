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
  loaiDatHang: 'NguyenLieu' | 'PhuLieu';
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
}

export class CreateMaterialOrderDto {
  lsxId: number;
  loaiDatHang: 'NguyenLieu' | 'PhuLieu';
  nguoiDat: string;
  tkId: number;
  ngayCanGiao?: string;
  ghiChuLot?: string;
  ghiChu?: string;
  items: MaterialOrderItemDto[];
}
