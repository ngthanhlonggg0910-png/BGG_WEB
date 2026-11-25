import {
  TEC_GetGiayDeNghi_ByBarcodeMau,
  TEC_GetTrangThai_ByBarCodeMau,
  TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau,
  TEC_GetTrangThai_ByBarcodeMauAndLoai,
  TEC_BarcodeMau_UpdateTrangThai_Mobile,
  TEC_BarcodeMau_SelectThongTinKiemMau,
  TEC_KiemMau_DanhSachLoi,
  TEC_KiemMau_Master_KiemTraTonTai,
  TEC_KiemMau_Detail_Insert,
  TEC_KiemMau_Detail_Select,
} from '../entities/technical-department.js';

export interface ITechnicalDepartmentRepository {
  layThongTinGiayDeNghiTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_GetGiayDeNghi_ByBarcodeMau>;

  layTrangThaiTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_GetTrangThai_ByBarCodeMau>;

  layDanhSachFileTaiLieuTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau[]>;

  layTrangThaiTheoLoaiVaBarcodeMau(
    BarcodeMau: string,
    Loai: string,
  ): Promise<TEC_GetTrangThai_ByBarcodeMauAndLoai>;

  capNhatTrangThai_TEC_BarcodeMau(
    TrangThai: string,
    isSua: boolean,
    BarcodeMau: string,
    LoaiKiemMau: string,
  ): Promise<TEC_BarcodeMau_UpdateTrangThai_Mobile>;

  TEC_BarcodeMau_SelectThongTinKiemMau(
    BarcodeMau: string,
  ): Promise<TEC_BarcodeMau_SelectThongTinKiemMau>;

  layDanhSachLoi(): Promise<TEC_KiemMau_DanhSachLoi[]>;

  TEC_KiemMau_Master_KiemTraTonTai(
    BarcodeMau: string,
    LoaiKiem: string,
    NguoiKiemMau: string,
    TKId: number,
  ): Promise<TEC_KiemMau_Master_KiemTraTonTai>;

  TEC_KiemMau_Detail_Insert(
    IdKiemMauMaster: number,
    BarcodeMau: string,
    ViTriLoi: string,
    NguoiKhaiBao: string,
    MucDoNghiemTrong: string,
    MaLoi: string,
    TenLoi: string,
    CumLoiId: number,
    SL: number,
    BienPhapXuLy: string,
    GhiChu: string,
    LoaiKiem: string,
    Image: string | null,
  ): Promise<TEC_KiemMau_Detail_Insert>;

  TEC_KiemMau_Detail_Select(
    BarcodeMau: string,
  ): Promise<TEC_KiemMau_Detail_Select[]>;

  TEC_KiemMau_Detail_Delete(IdDetail: number): Promise<number>;

  TEC_KiemMau_Detail_LayImagePath(
    IdDetail: number,
  ): Promise<string | null | undefined>;

  TEC_KiemMau_Detail_DemSuDungImagePath(ImagePath: string): Promise<number>;

  TEC_KiemMau_Detail_Update(
    IdDetail: number,
    IdKiemMauMaster: number,
    BarcodeMau: string,
    ViTriLoi: string,
    NguoiKhaiBao: string,
    MucDoNghiemTrong: string,
    MaLoi: string,
    TenLoi: string,
    CumLoiId: number,
    SL: number,
    BienPhapXuLy: string,
    GhiChu: string,
    LoaiKiem: string,
    Image: string | null,
    RemoveImage: boolean,
  ): Promise<{ UpdatedId: number }>;
}
