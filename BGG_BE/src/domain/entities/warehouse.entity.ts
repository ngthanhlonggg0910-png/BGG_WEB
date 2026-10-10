export class lib_DanhSachDanhSachKho_TheoTKId {
  KId: number;
  MaKho: string;
  TenKho: string;
  ThuKhoId: number;
  TenThuKho: string;
  NguoiTao: number;
  TenNguoiTao: string;
  NgayTao: Date;
  LoaiKho: string;
}

//Chức năng Kho chi tiết
export class lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId {
  TongSoCay: number;
  TongSoLuong: number;
  Item: string;
  Art: string | null;
  Lot: string;
  MaMau: string;
  TrangThaiDanhGia: string;
}

//Tìm theo vị trí
export class lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode {
  PO: string;
  SizeCode: string;
  TenViTri: string;
  TongSoKien: number;
  TongSoLuong: number;
}

//Dùng để tìm theo mã hàng
export class lib_Ro_DanhSachTheoKID_MaHang {
  MaRo: string;
  TenRo: string;
  VTId: number;
  TenViTri: string;
  NguoiTao: string;
  TenNguoiTao: string;
  NgayTao: Date;
  SoLuong: number;
}

//Tìm theo mã vật tư
export class lib_Ro_DanhSachTheoKID_MaCay_TKId {
  MaRo: string;
  TenRo: string;
  VTId: number;
  TenViTri: string;
  NguoiTao: string;
  TenNguoiTao: string;
  NgayTao: Date;
  SoLuong: number;
}
