export class User {
  constructor(
    public readonly UEId: number,
    public readonly TenDangNhap: string,
    public readonly NVId: number,
    public readonly NgayHetHan: Date,
    public readonly MaNhanVien: string,
    public readonly HoVaTenLot: string,
    public readonly Ten: string,
    public readonly Email: string,
    public readonly PbId: number,
    public readonly HinhAnh: string | null,
    public readonly SoNoiBo: string | null,
    public readonly SoDienThoai: string | null,
    public readonly TKId: number,
  ) {}
}
