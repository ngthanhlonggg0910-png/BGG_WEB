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
}
