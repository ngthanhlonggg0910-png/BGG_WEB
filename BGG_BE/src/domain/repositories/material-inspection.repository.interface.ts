import type {
  MaterialAccessoryDefect,
  MaterialInspectionAccessoryDefect,
} from '../entities/material-inspection.entity.js';

export interface IMaterialInspectionRepository {
  getAccessoryDefects(): Promise<MaterialAccessoryDefect[]>;

  getDeclaredAccessoryDefects(): Promise<MaterialInspectionAccessoryDefect[]>;

  deleteDeclaredAccessoryDefect(id: number): Promise<number>;

  updateInspectionRate(
    tiLe: number,
    loaiTiLe: string,
    ctpGdId: number,
  ): Promise<void>;

  updateHuongXuLy(Option: string, CTPGDId: number): Promise<{ KetQua: number }>;

  updateTrangThai(
    PGDId: number,
    TrangThai: string,
    NoiDung: string,
    NguoiThayDoi: string,
    TaiKhoanThayDoi: string,
    MacAddress: string,
    ComputerName: string,
  ): Promise<{ KetQua: number }>;

  khaiBaoLoiPhuLieu(
    CTPGDId: number,
    MaLoi: string,
    SoLuongLoi: number,
    TenNguoiTao: string,
  ): Promise<{ KetQua: number }>;
}
