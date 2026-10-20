import {
  IsDateString,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

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
