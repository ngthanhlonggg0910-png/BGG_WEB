export class QM_PhieuKiemVai_TheoTKId_RequestDTO {
  TKId: number;
  MaHang: string;
}

export class QM_PhieuKiemVai_CayVai_TheoPKVId_RequestDTO {
  PKVId: number;
  MaCay: string;
}

export class QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_RequestDTO {
  ViTri: string;
}

export class QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_RequestDTO {
  CTId: number;
  MaLoi: string;
  TenLoi: string;
  ViTriKiem: string;
  SoDiem: number;
  TuViTri: number;
  DenViTri: number;
  SoLoi: number;
  TongDiem: number;
  SoDiemTrungBinh: number;
  SoYard: number;
}

export class QM_DoKhoVai_ThemMoi_RequestDTO {
  CTId: number;
  ViTri: string;
  KhoCM: number;
  KhoIN: number;
}

export class QM_PhieuKiemVai_CayVai_CapNhatGhiChu_RequestDTO {
  CTId: number;
  GhiChu: string;
  HuongXuLy: string;
}

export class QM_PhieuKiemVai_CayVai_Delete_RequestDTO {
  CTId: number;
  CayId: number;
  MaCayVai: string;
}

export class QM_PhieuKiemVai_CayVai_XongCay_Android_RequestDTO {
  CTId: number;
  GhiChu: string;
  KetQuaKiem: boolean;
  KetQuaDoAm: boolean;
  DoAm: number;
  DiemTrungBinh: number;
  SoLuongThucTe: number;
  NguoiXongCay: string;
  TrongLuongVai: string;
}

export class QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_RequestDTO {
  TKId: number;
  MaCay: string;
}

export class QM_PhieuKiemVai_TaoPhieuKiem_RequestDTO {
  TKId: number;
  MaHang: string;
  ChungLoai: string;
  Item: string;
  Art: string;
  TenMau: string;
  NgayKiemVai: Date;
  NhaCungCap: string;
  LOT: string;
}

export class layMaMau_RequestDTO {
  MaHang: string;
  Item: string;
  ChungLoai: string;
}
