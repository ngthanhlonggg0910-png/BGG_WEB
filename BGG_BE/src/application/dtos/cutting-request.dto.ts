export class Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_RequestDTO {
  MaHang: string;
  SoPhieu: string;
  NgayHoachToan: Date;
  DaHoachToan: boolean;
  NhomCat: string;
  BanCat: string;
}

export class wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_RequestDTO {
  PhieuHoachToanId: number;
  MaCay: string;
}

export class capNhatHoachToan_RequestDTO {
  PhieuHoachToanId: number;
  DaiBanTraiThucTe: number;
  KhoVaiThucTe: number;
  RongSoDo: number;
  DaiSoDo: number;
}

export class capNhatTraiVai_RequestDTO {
  PhieuHoachToanId: number;
  TenNguoiTrai: string;
}

export class khoaPhieu_RequestDTO {
  PhieuHoachToanId: number;
  DaHoachToan: boolean;
  TKId: number;
  NguoiKhoaPhieu: string;
}

export class kiemTraCayDeNoi_RequestDTO {
  PhieuHoachToanId: number;
  ChiTietPhieuHoachToanId: number;
  MaCay: string;
}

export class layThongTinCay_RequestDTO {
  MaCay: string;
  PhieuHoachToanId: number;
}

export class layDanhSachCayNoiBaoGomCayGoc_RequestDTO {
  ChiTietPhieuHoachToanId: number;
}

export class quetNhanCayGoc_RequestDTO {
  PhieuHoachToanId: number;
  MaCay: string;

  MauLot?: string;
  MauVai?: string;
  PO?: string;
  MauSP?: string;
  ChungLoai?: string;

  Yard: number;
  Met: number;
  ThucTe: number;
  Thua: number;
  Thieu: number;

  SoMetTrai: number;
  TieuHaoThucTe: number;
  NguyenCay: number;
  SoBTP: number;

  ThuHoi1: number;
  ThuHoi2: number;
  ThuHoi3: number;
  ThuHoi4: number;
  ThuHoi5: number;
}

export class Cutting_HoachToanThuong_QuetNhanCay_RequestDTO {
  PhieuHoachToanId: number;
  MaCay: string;

  MauLot?: string;
  MauVai?: string;
  PO?: string;
  MauSP?: string;
  ChungLoai?: string;

  Yard?: number;
  Met?: number;
  ThucTe?: number;
  Thua?: number;
  Thieu?: number;
  NguyenCay?: number;
  SoBTP?: number;

  DauKhuc?: number;
  ThayThan?: number;
  Cay?: number | null;

  ThuHoi1?: number;
  ThuHoi2?: number;
  ThuHoi3?: number;
  ThuHoi4?: number;
  ThuHoi5?: number;

  SoLopTrai: number;
  DaiBanTraiThucTe: number;
}

export class themCayNoi_RequestDTO {
  ChiTietPhieuHoachToanId: number;
  PhieuHoachToanId: number;
  MaCay: string;
  MauLot: string;
  MauVai: string;
  PO: string;
  Yard: number;
  Met: number;
  SoMetTrai: number;
  TieuHaoThucTe: number;
  ThucTe: number;
  Thua: number;
  Thieu: number;
  NguyenCay: number;
  ThuHoi1: number;
  ThuHoi2: number;
  ThuHoi3: number;
  ThuHoi4: number;
  ThuHoi5: number;
  SoBTP: number;
  Cay: number;
}
