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
  /** OMM_PO_BangDinhMuc.PDMId of the BOM line (required; the server re-reads the line from it). */
  pdmId: number;
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
  /** Ignored: the orderer is the logged-in account (filled in by the server). */
  nguoiDat?: string;
  /** Ignored: the orderer is the logged-in account (filled in by the server). */
  tkId?: number;
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
