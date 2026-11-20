export interface LoginResponseData {
  UEId: number;
  TenDangNhap: string;
  NVId: number;
  NgayHetHan: Date;
  MaNhanVien: string;
  HoVaTenLot: string;
  Ten: string;
  Email: string;
  PbId: number;
  HinhAnh: string | null;
  SoNoiBo: string | null;
  SoDienThoai: string | null;
  TKId: number;
  /** Bearer token required by every protected /api endpoint. */
  accessToken: string;
  pushToken?: string;
}

export class LoginResponseDTO {
  success: boolean;
  message: string;
  data?: LoginResponseData;

  constructor(success: boolean, message: string, data?: LoginResponseData) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
