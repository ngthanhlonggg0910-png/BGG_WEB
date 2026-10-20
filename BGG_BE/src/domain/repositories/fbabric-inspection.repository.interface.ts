import type {
  QM_PhieuKiemVai_TheoTKId,
  QM_PhieuKiemVai_CayVai_TheoPKVId,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi,
} from '../entities/fbabric-inspection.js';

export interface IFabricInspectionRepository {
  loadPhieuTheoTKId(
    TKId: number,
    MaHang: string,
  ): Promise<QM_PhieuKiemVai_TheoTKId[]>;

  loadCayVaiTheoPhieuKiem(
    PKVId: number,
    MaCay: string,
  ): Promise<QM_PhieuKiemVai_CayVai_TheoPKVId[]>;

  loadDanhSachLoi(
    ViTri: string,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi[]>;
}
