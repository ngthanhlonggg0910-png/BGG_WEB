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
  TongSoThung?: number;
  SoThungDaNhan?: number;
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
  MaGPA?: string;
  MaRo?: string;
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

export interface MaterialReceiptThungItemEntity {
  ChiTietPhieuSoanHangId: number;
  CayId: number;
  MaCay: string;
  MaCayMoi?: string;
  MaVatTu: string;
  TenVatTu: string;
  MaMau?: string;
  QuyCach?: string;
  DVT?: string;
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

export interface MaterialReceiptThungEntity {
  MaGPA: string; // e.g. "GPA26100107" hoặc "" (Hàng lẻ)
  TenThung: string; // e.g. "Thùng GPA26100107" hoặc "Phụ liệu lẻ (Chưa đóng thùng)"
  TongSoCay: number;
  SoCayDaNhan: number;
  TongSoLuongXuat: number;
  SoLuongDaNhan: number;
  TrangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu';
  cays: MaterialReceiptThungItemEntity[];
}
