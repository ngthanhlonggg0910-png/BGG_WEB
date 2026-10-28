import type {
  QM_PhieuKiemVai_TheoTKId,
  QM_PhieuKiemVai_CayVai_TheoPKVId,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi,
  QM_PhieuKiemVai_Cay_ChiTiet,
  QM_DoKhoVai,
  QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile,
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

  layChiTietCayVai(CTId: number): Promise<QM_PhieuKiemVai_Cay_ChiTiet[]>;

  themLoiCayVai(
    CTId: number,
    MaLoi: string,
    TenLoi: string,
    ViTriKiem: string,
    SoDiem: number,
    TuViTri: number,
    DenViTri: number,
    SoLoi: number,
    TongDiem: number,
    SoDiemTrungBinh: number,
    SoYard: number,
  ): Promise<void>;

  //ĐO KHỔ
  doKho(
    CTId: number,
    ViTri: string,
    KhoCM: number,
    KhoIN: number,
  ): Promise<void>;

  //LẤY KẾT QUẢ ĐO
  layKetQuaDo(CTId: number): Promise<QM_DoKhoVai[]>;

  //Update ghi chú && hướng xử lý
  capNhatGhiChuHuongXuLyCayVai(
    CTId: number,
    GhiChu: string,
    HuongXuLy: string,
  ): Promise<void>;

  //XÓA CÂY
  xoaCayVai(CTId: number, CayId: number, MaCayVai: string): Promise<void>;

  //XONG CÂY
  xongCayVai(
    CTId: number,
    GhiChu: string,
    KetQuaKiem: boolean,
    KetQuaDoAm: boolean,
    DoAm: number,
    DiemTrungBinh: number,
    SoLuongThucTe: number,
    NguoiXongCay: string,
    TrongLuongVai: string,
  ): Promise<void>;

  taoPhieuKiemVaiAuto(
    TKId: number,
    MaCay: string,
  ): Promise<QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile>;

  taoPhieuKiemThuCong(
    TKId: number,
    MaHang: string,
    ChungLoai: string,
    Item: string,
    Art: string,
    TenMau: string,
    NgayKiemVai: Date,
    NhaCungCap: string,
    LOT: string,
  ): Promise<{ SoPhieuKiem: string }>;

  layDanhSachMaHang(): Promise<{ MaHang: string }[]>;

  layDanhSachChungLoaiCoItem(
    MaHang: string,
    Item: string,
  ): Promise<{ TenChungLoai: string }[]>;

  layDanhSachChungLoaiKoItem(
    MaHang: string,
  ): Promise<{ TenChungLoai: string }[]>;

  layDanhSachItem(MaHang: string): Promise<{ Item: string }[]>;

  layMaMau(
    MaHang: string,
    Item: string,
    ChungLoai: string,
  ): Promise<{ MaMau: string }[]>;

  layArt(MaHang: string): Promise<{ QuyCach: string }[]>;
}
