import {
  Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_RequestDTO,
  wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_RequestDTO,
  capNhatHoachToan_RequestDTO,
  capNhatTraiVai_RequestDTO,
  khoaPhieu_RequestDTO,
  kiemTraCayDeNoi_RequestDTO,
  layThongTinCay_RequestDTO,
  layDanhSachCayNoiBaoGomCayGoc_RequestDTO,
  quetNhanCayGoc_RequestDTO,
  Cutting_HoachToanThuong_QuetNhanCay_RequestDTO,
  themCayNoi_RequestDTO,
} from '../dtos/cutting-request.dto.js';

import {
  CUTTING_LAYDANHSACH_BANCAT_THEO_TKID_ResponseDTO,
  Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_ResponseDTO,
  wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_ResponseDTO,
  getChungLoaiByPHTId_ResponseDTO,
  getDsMauVaiVaMauSanPhamTheoPHTId_ResponseDTO,
  Cutting_PhieuHoachToan_DanhSachPO_ResponseDTO,
  getRongSdVaDaiSdTheoMaPhieu_ResponseDTO,
  getThongTinTraiByPHTId_ResponseDTO,
  getTinhTrangKhoaPhieuByPHTId_ResponseDTO,
  layTongSoLop_ResponseDTO,
  capNhatHoachToan_ResponseDTO,
  capNhatTraiVai_ResponseDTO,
  khoaPhieu_ResponseDTO,
  kiemTraCayDeNoi_ResponseDTO,
  layThongTinCay_ResponseDTO,
  layDanhSachCayNoiBaoGomCayGoc_ResponseDTO,
  quetNhanCayGoc_ResponseDTO,
  Cutting_HoachToanThuong_QuetNhanCay_ResponseDTO,
  themCayNoi_ResponseDTO,
} from '../dtos/cutting-response.dto.js';

export interface ICuttingService {
  loadDanhSachBanCat(
    TKId: number,
  ): Promise<CUTTING_LAYDANHSACH_BANCAT_THEO_TKID_ResponseDTO>;

  loadDanhSachPhieuHoachToan(
    dto: Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_RequestDTO,
  ): Promise<Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_ResponseDTO>;

  loadDanhSachChiTietPhieuHoachToanTheoPHTId(
    dto: wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_RequestDTO,
  ): Promise<wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_ResponseDTO>;

  getChungLoaiByPHTId(
    PhieuHoachToanId: number,
  ): Promise<getChungLoaiByPHTId_ResponseDTO>;

  getDsMauVaiVaMauSanPhamTheoPHTId(
    PhieuHoachToanId: number,
  ): Promise<getDsMauVaiVaMauSanPhamTheoPHTId_ResponseDTO>;

  getDanhSachPOByPHTId(
    PhieuHoachToanId: number,
  ): Promise<Cutting_PhieuHoachToan_DanhSachPO_ResponseDTO>;

  getRongSdVaDaiSdTheoMaPhieu(
    MaPhieu: number,
  ): Promise<getRongSdVaDaiSdTheoMaPhieu_ResponseDTO>;

  getThongTinTraiByPHTId(
    PhieuHoachToanId: number,
  ): Promise<getThongTinTraiByPHTId_ResponseDTO>;

  getTinhTrangKhoaPhieuByPHTId(
    PhieuHoachToanId: number,
  ): Promise<getTinhTrangKhoaPhieuByPHTId_ResponseDTO>;

  layTongSoLop(PhieuHoachToanId: number): Promise<layTongSoLop_ResponseDTO>;

  capNhatHoachToan(
    dto: capNhatHoachToan_RequestDTO,
  ): Promise<capNhatHoachToan_ResponseDTO>;

  capNhatTraiVai(
    dto: capNhatTraiVai_RequestDTO,
  ): Promise<capNhatTraiVai_ResponseDTO>;

  khoaPhieu(dto: khoaPhieu_RequestDTO): Promise<khoaPhieu_ResponseDTO>;

  kiemTraCayDeNoi(
    dto: kiemTraCayDeNoi_RequestDTO,
  ): Promise<kiemTraCayDeNoi_ResponseDTO>;

  layThongTinCay(
    dto: layThongTinCay_RequestDTO,
  ): Promise<layThongTinCay_ResponseDTO>;

  layDanhSachCayNoiBaoGomCayGoc(
    dto: layDanhSachCayNoiBaoGomCayGoc_RequestDTO,
  ): Promise<layDanhSachCayNoiBaoGomCayGoc_ResponseDTO>;

  quetNhanCayGoc(
    dto: quetNhanCayGoc_RequestDTO,
  ): Promise<quetNhanCayGoc_ResponseDTO>;

  quetNhanCayHoachToanThuong(
    dto: Cutting_HoachToanThuong_QuetNhanCay_RequestDTO,
  ): Promise<Cutting_HoachToanThuong_QuetNhanCay_ResponseDTO>;

  themCayNoi(dto: themCayNoi_RequestDTO): Promise<themCayNoi_ResponseDTO>;
}
