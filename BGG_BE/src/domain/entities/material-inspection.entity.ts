import { IsIn, IsInt, IsString, isIn } from 'class-validator';

export class MaterialAccessoryDefect {
  @IsString()
  MaLoi: string;

  @IsString()
  TenLoi: string;
}

export class MaterialInspectionAccessoryDefect {
  Id: number;
  CTPGDId: number;
  MaLoi: string;
  TenLoi: string;
  SoLuongLoi: number;
  TenNguoiTao: string;
  ThoiGian: Date;
}
