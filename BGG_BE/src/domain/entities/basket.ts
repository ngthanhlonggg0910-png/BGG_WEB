export class BasketLocation {
  constructor(public readonly KetQua: number) {}
}

export class RIdAndMaRo {
  RId: number;
  MaRo: string;
}

//danh sách cây thuộc rổ, được tìm theo KID và mã rổ. -> chỉ lấy cột thông tin trong bảng
export class BasketFabricRoll {
  MaCay: string;
  Item: string;
  Art: string;
  Lot: string;
  MaMau: string;
  MaRo: string;
  ThongTin: string;
  TenViTri: string;
  TongSoLuong: string;
  KhachHang: string;
  Brand: string;
}

export class BasketFabricRollDetail {
  MaCay: string;
  Item: string;
  Art: string;
  Lot: string;
  MaMau: string;
  MaRo: string;
  ThongTin: string;
  VTId: number;
  TenViTri: string;
  NguoiTao: string;
  TenNguoiTao: string;
  NgayTao: Date;
  TongSoLuong: number;
  TongSoCay: number;
  KhachHang: string;
  Brand: string;
}
