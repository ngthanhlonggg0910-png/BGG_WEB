import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class wh_DanhSachDonNhanHang_RequestDTO {
  @IsOptional()
  @IsString()
  loaiDatHang?: string; // 'NguyenLieu' | 'PhuLieu' | 'ALL'

  @IsOptional()
  @IsString()
  trangThai?: string; // 'ALL' | 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu'

  @IsOptional()
  @IsDateString()
  tuNgay?: string;

  @IsOptional()
  @IsDateString()
  denNgay?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsInt()
  tkId?: number;
}

export class wh_ChiTietDonNhanHang_RequestDTO {
  @IsInt()
  @Min(1)
  PhieuSoanHangId: number;

  @IsOptional()
  @IsInt()
  DonDatHangId?: number;
}

export class wh_QuetNhanCay_RequestDTO {
  @IsInt()
  @Min(1)
  PhieuSoanHangId: number;

  @IsString()
  @IsNotEmpty()
  MaCay: string;

  @IsOptional()
  @IsNumber()
  SoLuongThucNhan?: number;

  @IsInt()
  @Min(1)
  tkId: number;

  @IsString()
  @IsNotEmpty()
  tenNguoiNhan: string;

  @IsOptional()
  @IsString()
  xiNghiepNhan?: string;

  @IsOptional()
  @IsString()
  action?: 'xac_nhan' | 'huy_nhan';
}

export class wh_XacNhanNhanHang_RequestDTO {
  @IsInt()
  @Min(1)
  PhieuSoanHangId: number;

  @IsOptional()
  @IsBoolean()
  nhanTatCa?: boolean;

  @IsOptional()
  @IsBoolean()
  huyNhanTatCa?: boolean;

  @IsOptional()
  @IsBoolean()
  chotHoanTat?: boolean;

  @IsInt()
  @Min(1)
  tkId: number;

  @IsString()
  @IsNotEmpty()
  tenNguoiNhan: string;

  @IsOptional()
  @IsString()
  xiNghiepNhan?: string;

  @IsOptional()
  @IsString()
  ghiChu?: string;
}
