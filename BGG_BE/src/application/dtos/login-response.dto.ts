export class LoginResponseDTO {
  success: boolean;
  message: string;
  data?: {
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
  };

  constructor(
    success: boolean,
    message: string,
    data?: {
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
    },
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export class GetUsernameAndPassword_ResponseDTO {
  success: boolean;
  message: string;
  data: {
    TenDangNhap: string;
    MatKhau: string;
  } | null;
}
