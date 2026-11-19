import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { ICuttingService } from '../../application/interfaces/cutting.service.interface.js';
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
} from '../../application/dtos/cutting-response.dto.js';
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
} from '../../application/dtos/cutting-request.dto.js';
@Controller('cutting')
export class CuttingController {
  constructor(
    @Inject('ICuttingService')
    private readonly cuttingService: ICuttingService,
  ) {}

  @Post('CUTTING_LAYDANHSACH_BANCAT_THEO_TKID')
  loadDanhSachBanCat(
    @Body('TKId') TKId: number,
  ): Promise<CUTTING_LAYDANHSACH_BANCAT_THEO_TKID_ResponseDTO> {
    return this.cuttingService.loadDanhSachBanCat(TKId);
  }

  @Post('Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android')
  loadDanhSachPhieuHoachToan(
    @Body()
    dto: Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_RequestDTO,
  ): Promise<Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_ResponseDTO> {
    return this.cuttingService.loadDanhSachPhieuHoachToan(dto);
  }

  @Post('wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId')
  loadDanhSachChiTietPhieuHoachToanTheoPHTId(
    @Body()
    dto: wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_RequestDTO,
  ): Promise<wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_ResponseDTO> {
    return this.cuttingService.loadDanhSachChiTietPhieuHoachToanTheoPHTId(dto);
  }

  @Post('CUTTING_PhieuHoachToan_Select_ChungLoai')
  getChungLoaiByPHTId(
    @Body('PhieuHoachToanId') PhieuHoachToanId: number,
  ): Promise<getChungLoaiByPHTId_ResponseDTO> {
    return this.cuttingService.getChungLoaiByPHTId(PhieuHoachToanId);
  }

  @Post('Cutting_LayDSMauVaiVaMauSanSanPham')
  getDsMauVaiVaMauSanPhamTheoPHTId(
    @Body('PhieuHoachToanId') PhieuHoachToanId: number,
  ): Promise<getDsMauVaiVaMauSanPhamTheoPHTId_ResponseDTO> {
    return this.cuttingService.getDsMauVaiVaMauSanPhamTheoPHTId(
      PhieuHoachToanId,
    );
  }

  @Post('Cutting_PhieuHoachToan_DanhSachPO')
  getDanhSachPOByPHTId(
    @Body('PhieuHoachToanId') PhieuHoachToanId: number,
  ): Promise<Cutting_PhieuHoachToan_DanhSachPO_ResponseDTO> {
    return this.cuttingService.getDanhSachPOByPHTId(PhieuHoachToanId);
  }

  @Post('Cutting_GetInfoRongVaDaiSoDo_TheoMaPhieu_Android')
  getRongSdVaDaiSdTheoMaPhieu(
    @Body('MaPhieu') MaPhieu: number,
  ): Promise<getRongSdVaDaiSdTheoMaPhieu_ResponseDTO> {
    return this.cuttingService.getRongSdVaDaiSdTheoMaPhieu(MaPhieu);
  }

  @Post('Cutting_PhieuHoachToan_GetThongTinTrai')
  getThongTinTraiByPHTId(
    @Body('PhieuHoachToanId') PhieuHoachToanId: number,
  ): Promise<getThongTinTraiByPHTId_ResponseDTO> {
    return this.cuttingService.getThongTinTraiByPHTId(PhieuHoachToanId);
  }

  @Post('Cutting_PhieuHoachToan_LayTinhTrangKhoaPhieu')
  getTinhTrangKhoaPhieuByPHTId(
    @Body('PhieuHoachToanId') PhieuHoachToanId: number,
  ): Promise<getTinhTrangKhoaPhieuByPHTId_ResponseDTO> {
    return this.cuttingService.getTinhTrangKhoaPhieuByPHTId(PhieuHoachToanId);
  }

  @Post('CUTTING_PhieuHoachToan_GetTongSoLop')
  layTongSoLop(
    @Body('PhieuHoachToanId') PhieuHoachToanId: number,
  ): Promise<layTongSoLop_ResponseDTO> {
    return this.cuttingService.layTongSoLop(PhieuHoachToanId);
  }

  @Post('Cutting_PhieuHoachToan_CapNhatHachToan_Android')
  capNhatHoachToan(
    @Body() dto: capNhatHoachToan_RequestDTO,
  ): Promise<capNhatHoachToan_ResponseDTO> {
    return this.cuttingService.capNhatHoachToan(dto);
  }

  @Post('Cutting_PhieuHoachToan_CapNhatPHT_DaTrai')
  capNhatTraiVai(
    @Body() dto: capNhatTraiVai_RequestDTO,
  ): Promise<capNhatTraiVai_ResponseDTO> {
    return this.cuttingService.capNhatTraiVai(dto);
  }

  @Post('Cutting_PhieuHoachToan_CapNhatTrangThai')
  khoaPhieu(@Body() dto: khoaPhieu_RequestDTO): Promise<khoaPhieu_ResponseDTO> {
    return this.cuttingService.khoaPhieu(dto);
  }

  @Post('Cutting_KiemTraCayVaiTruocKhiNoi')
  kiemTraCayDeNoi(
    @Body() dto: kiemTraCayDeNoi_RequestDTO,
  ): Promise<kiemTraCayDeNoi_ResponseDTO> {
    return this.cuttingService.kiemTraCayDeNoi(dto);
  }

  @Post('Cutting_VaiNoi_LayThongTinCay')
  layThongTinCay(
    @Body() dto: layThongTinCay_RequestDTO,
  ): Promise<layThongTinCay_ResponseDTO> {
    return this.cuttingService.layThongTinCay(dto);
  }

  @Post('Cutting_VaiNoi_LayDanhSachCayNoiBaoGomCayGoc')
  layDanhSachCayNoiBaoGomCayGoc(
    @Body() dto: layDanhSachCayNoiBaoGomCayGoc_RequestDTO,
  ): Promise<layDanhSachCayNoiBaoGomCayGoc_ResponseDTO> {
    return this.cuttingService.layDanhSachCayNoiBaoGomCayGoc(dto);
  }

  @Post('Cutting_VaiNoi_QuetNhanCayGoc')
  quetNhanCayGoc(
    @Body() dto: quetNhanCayGoc_RequestDTO,
  ): Promise<quetNhanCayGoc_ResponseDTO> {
    return this.cuttingService.quetNhanCayGoc(dto);
  }

  @Post('Cutting_HoachToanThuong_QuetNhanCay')
  quetNhanCayHoachToanThuong(
    @Body() dto: Cutting_HoachToanThuong_QuetNhanCay_RequestDTO,
  ): Promise<Cutting_HoachToanThuong_QuetNhanCay_ResponseDTO> {
    return this.cuttingService.quetNhanCayHoachToanThuong(dto);
  }

  @Post('Cutting_VaiNoi_ThemCayTiep')
  themCayNoi(
    @Body() dto: themCayNoi_RequestDTO,
  ): Promise<themCayNoi_ResponseDTO> {
    return this.cuttingService.themCayNoi(dto);
  }
}
