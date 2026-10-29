import {
  QM_PhieuKiemVai_TheoTKId_RequestDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_RequestDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_RequestDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_RequestDTO,
  QM_DoKhoVai_ThemMoi_RequestDTO,
  QM_PhieuKiemVai_CayVai_CapNhatGhiChu_RequestDTO,
  QM_PhieuKiemVai_CayVai_Delete_RequestDTO,
  QM_PhieuKiemVai_CayVai_XongCay_Android_RequestDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_RequestDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_RequestDTO,
  layMaMau_RequestDTO,
  layArt_RequestDTO,
  layLot_RequestDTO,
} from '../dtos/fabric-inspection-request.dto.js';
import {
  QM_PhieuKiemVai_TheoTKId_ResponseDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_ResponseDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_ResponseDTO,
  QM_DoKhoVai_ThemMoi_ResponseDTO,
  QM_DoKhoVai_ResponseDTO,
  QM_PhieuKiemVai_CayVai_CapNhatGhiChu_ResponseDTO,
  QM_PhieuKiemVai_CayVai_Delete_ResponseDTO,
  QM_PhieuKiemVai_CayVai_XongCay_Android_ResponseDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_ResponseDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_ResponseDTO,
  QM_PhieuKiemVai_LayDanhSachMaHang_Web_ResponseDTO,
  layDanhSachChungLoaiCoItem_ResponseDTO,
  layDanhSachChungLoaiKoItem_ResponseDTO,
  layDanhSachItem_ResponseDTO,
  layMaMau_ResponseDTO,
  layArt_ResponseDTO,
  layLot_ResponseDTO,
  layNCC_ResponseDTO,
} from '../dtos/fabric-inspection-response.dto.js';

export interface IFabricInspectionService {
  loadPhieuTheoTKId(
    dto: QM_PhieuKiemVai_TheoTKId_RequestDTO,
  ): Promise<QM_PhieuKiemVai_TheoTKId_ResponseDTO>;

  loadCayVaiTheoPhieuKiem(
    dto: QM_PhieuKiemVai_CayVai_TheoPKVId_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_TheoPKVId_ResponseDTO>;

  loadDanhSachLoi(
    dto: QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_RequestDTO,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO>;

  layChiTietCayVai(
    CTId: number,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO>;

  themLoiCayVai(
    dto: QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_RequestDTO,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_ResponseDTO>;

  doKho(
    dto: QM_DoKhoVai_ThemMoi_RequestDTO,
  ): Promise<QM_DoKhoVai_ThemMoi_ResponseDTO>;

  layKetQuaDo(CTId: number): Promise<QM_DoKhoVai_ResponseDTO>;

  capNhatGhiChuHuongXuLyCayVai(
    dto: QM_PhieuKiemVai_CayVai_CapNhatGhiChu_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_CapNhatGhiChu_ResponseDTO>;

  xoaCayVai(
    dto: QM_PhieuKiemVai_CayVai_Delete_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_Delete_ResponseDTO>;

  xongCayVai(
    dto: QM_PhieuKiemVai_CayVai_XongCay_Android_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_XongCay_Android_ResponseDTO>;

  taoPhieuKiemVaiAuto(
    dto: QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_RequestDTO,
  ): Promise<QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_ResponseDTO>;

  taoPhieuKiemThuCong(
    dto: QM_PhieuKiemVai_TaoPhieuKiem_RequestDTO,
  ): Promise<QM_PhieuKiemVai_TaoPhieuKiem_ResponseDTO>;

  layDanhSachMaHang(): Promise<QM_PhieuKiemVai_LayDanhSachMaHang_Web_ResponseDTO>;

  layDanhSachChungLoaiCoItem(
    MaHang: string,
    Item: string,
  ): Promise<layDanhSachChungLoaiCoItem_ResponseDTO>;

  layDanhSachChungLoaiKoItem(
    MaHang: string,
  ): Promise<layDanhSachChungLoaiKoItem_ResponseDTO>;

  layDanhSachItem(MaHang: string): Promise<layDanhSachItem_ResponseDTO>;

  layMaMau(dto: layMaMau_RequestDTO): Promise<layMaMau_ResponseDTO>;

  layArt(dto: layArt_RequestDTO): Promise<layArt_ResponseDTO>;

  layLot(dto: layLot_RequestDTO): Promise<layLot_ResponseDTO>;

  layNCC(): Promise<layNCC_ResponseDTO>;
}
