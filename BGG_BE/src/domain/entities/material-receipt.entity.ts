export class MaterialReceiptOrderEntity {
  PhieuSoanHangId: number;
  MaSoPhieuSoan: string;
  NgaySoan?: Date;
  NgayTao?: Date;
  TinhTrangPSH: string;
  LoaiLenh?: string;
  LenhId?: number;
  NguoiXuat?: string;
  NgayXuat?: Date;
  DonDatHangId?: number;
  SoDonDatHang?: string;
  LoaiDatHang?: string; // 'NguyenLieu' | 'PhuLieu'
  TrangThaiDDH?: string;
  SoLSX?: string;
  MaHang?: string;
  NhaCat?: string;
  ToMay?: string;
  BoPhanNhan: string;
  TongSoCay: number;
  TongSoLuongXuat: number;
  SoCayDaNhan: number;
  SoLuongDaNhan: number;
  TrangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu';
  TiLeNhan: number;
  ThoiGianNhanMoiNhat?: Date;
  NguoiNhanMoiNhat?: string;
}

export class MaterialReceiptItemEntity {
  ChiTietPhieuSoanHangId: number;
  PhieuSoanHangId: number;
  MaVatTu: string;
  TenVatTu: string;
  MaMau?: string;
  QuyCach?: string;
  DVT?: string;
  SoLuongYeuCau: number;
  SoLuongThucSoan: number;
  SoCay: number;
  SoCayDaNhan: number;
  SoLuongDaNhan: number;
  cays: MaterialReceiptRollEntity[];
}

export class MaterialReceiptRollEntity {
  ChiTietPhieuSoanHangId: number;
  CayId: number;
  MaCay: string;
  MaCayMoi?: string;
  SoLuongXuat: number;
  isXacNhan: boolean;
  SoLuongThucNhan?: number;
  ThoiGianXacNhan?: Date;
  TKId?: number;
  NguoiXacNhan?: number;
  TenNguoiXacNhan?: string;
  XiNghiepXacNhan?: string;
  ThoiGianQuetXuat?: Date;
  TenNguoiQuetXuat?: string;
}
