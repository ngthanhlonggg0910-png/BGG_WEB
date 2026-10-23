export class QM_PhieuKiemVai_TheoTKId {
  PKVId: number;
  SoPhieuKiem: string;
  TenNgan: string;
  MaHang: string;
  CumPO: string;
  NgayNhanVai: Date | null;
  NgayKiemVai: Date;
  SoLuongNhan: number | null;
  SoLuongKiem: number | null;
  ChungLoai: string;
  NhanVienKiem: string;
  Item: string;
  ChungTu: string;
  TrangThai: string;
  MaMau: string;
  Art: string;
  Lot: string;
}

export class QM_PhieuKiemVai_CayVai_TheoPKVId {
  CTId: number;
  CayId: number;
  MaCayVai: string;
  SoLuongChungTu: number;
  SoLuongThucTe: number | null;
  KhoVaiTenTem: number;
  KhoVaiThucTe: string | null;
  KetQuaKiem: boolean | null;
  DiemTrungBinh: number | null;
  TenNguoiTao: string;
  NgayTao: Date;
  NguoiTao: string | null;
  TKId: number | null;
  PKVId: number;
  GhiChu: string | null;
  TrongLuongVai: string;
  Lot: string;
  MaNPL: string;
  TenNPL: string;
  ChungTu: string;
  MaMau: string;
  DoAm: number | null;
  TongDiem: number;
  SoCay: number;
  NhomKhachHang: string;
  HuongXuLy: string | null;
  VTId: number;
  NgayGiamDinh: Date;
  KetQuaDoAm: boolean | null;
  LoaiBienVai: string | null;
  SoCmBienVai: number | null;
  ThoiGianCapNhatMoiNhat: Date | null;
  SoRoll: number;
  MaHang: string;
  Mua: string | null;
}

export class QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi {
  TenLoi: string;
  MaLoi: string;
}

export class QM_DoKhoVai {
  KhoId: number;
  ViTri: string;
  KhoCM: number;
  KhoIN: number;
  TenNguoiTao: string;
  NgayTao: Date;
  NguoiTao: string;
  TKId: number;
  CTId: number;
}

export class QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile {
  ThongBao: string;
  PKVID: number;
  SoPhieuKiem: string;
}
