import {
  IsBoolean,
  IsDateString,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class wh_KiemTraTienDoSoanHang_RequestDTO {
  @IsInt()
  @Min(1)
  PhieuSoanHangId: number;
}

export class wh_XacNhanXuatKho_RequestDTO {
  @IsInt()
  @Min(1)
  PhieuSoanHangId: number;

  @IsBoolean()
  xacNhanHoanTat: boolean;

  @IsOptional()
  @IsBoolean()
  choPhepDongKhiThieu?: boolean;

  @IsInt()
  @Min(1)
  tkId: number;

  @IsString()
  @IsNotEmpty()
  tenNguoiXacNhan: string;

  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class wh_DanhSachPhieuSoanHangNgayVaTinhTrang_RequestDTO {
  @IsString()
  @IsNotEmpty()
  maKho: string;

  @IsInt()
  @Min(1)
  tkId: number;

  @IsDateString()
  ngaySoan: Date;

  @IsString()
  @IsNotEmpty()
  tinhTrang: string;
}

export class wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_RequestDTO {
  @IsInt()
  @Min(1)
  PhieuSoanHangId: number;
}

export class wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_RequestDTO {
  @IsInt()
  @Min(1)
  PhieuSoanHangId: number;

  @IsString()
  @IsNotEmpty()
  SoRo: string;
}

export class wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang_RequestDTO {
  PhieuSoanHangId: number;
  SoRo: string;
  MaCay: string;
}

export class wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_RequestDTO {
  @IsInt()
  @Min(1)
  PhieuSoanHangId: number;

  @IsString()
  @IsNotEmpty()
  MaCay: string;

  @IsNumber()
  @Min(0.001)
  SoLuongThucSoan: number;

  @IsInt()
  @Min(1)
  TKQuet: number;

  @IsString()
  @IsNotEmpty()
  TenNguoiQuyetXuat: string;
}
