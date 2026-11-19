import {
  Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android,
  wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId,
  Cutting_LayDSMauVaiVaMauSanSanPham,
  Cutting_GetInfoRongVaDaiSoDo_TheoMaPhieu_Android,
  Cutting_PhieuHoachToan_ThongTinTrai,
  Cutting_PhieuHoachToan_TinhTrangKhoaPhieu,
  Cutting_PhieuHoachToan_TongSoLop,
  Cutting_PhieuHoachToan_CapNhatTrangThai,
  Cutting_KiemTraCayVaiTruocKhiNoi,
  Cutting_VaiNoi_LayThongTinCay,
  Cutting_VaiNoi_QuetNhanCayGoc,
  Cutting_HoachToanThuong_QuetNhanCay,
  Cutting_VaiNoi_DanhSachCayNoiBaoGomCayGoc,
  Cutting_VaiNoi_ThemCayTiep,
} from '../../domain/entities/cutting.entity.js';
export class CUTTING_LAYDANHSACH_BANCAT_THEO_TKID_ResponseDTO {
  success: boolean;
  message: string;
  data: { TenBanCat: string }[] | null;
}

export class Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android[];
}

export class wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_ResponseDTO {
  success: boolean;
  message: string;
  data: wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId[];
}

export class getChungLoaiByPHTId_ResponseDTO {
  success: boolean;
  message: string;
  data: { ChungLoai: string }[];
}

export class getDsMauVaiVaMauSanPhamTheoPHTId_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_LayDSMauVaiVaMauSanSanPham[];
}

export class Cutting_PhieuHoachToan_DanhSachPO_ResponseDTO {
  success: boolean;
  message: string;
  data: string[];
}

export class getRongSdVaDaiSdTheoMaPhieu_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_GetInfoRongVaDaiSoDo_TheoMaPhieu_Android[];
}

export class getThongTinTraiByPHTId_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_PhieuHoachToan_ThongTinTrai | null;
}

export class getTinhTrangKhoaPhieuByPHTId_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_PhieuHoachToan_TinhTrangKhoaPhieu | null;
}

export class layTongSoLop_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_PhieuHoachToan_TongSoLop | null;
}

export class capNhatHoachToan_ResponseDTO {
  success: boolean;
  message: string;
}

export class capNhatTraiVai_ResponseDTO {
  success: boolean;
  message: string;
}

export class khoaPhieu_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_PhieuHoachToan_CapNhatTrangThai;
}

export class kiemTraCayDeNoi_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_KiemTraCayVaiTruocKhiNoi;
}

export class layThongTinCay_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_VaiNoi_LayThongTinCay;
}

export class layDanhSachCayNoiBaoGomCayGoc_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_VaiNoi_DanhSachCayNoiBaoGomCayGoc[];
}

export class quetNhanCayGoc_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_VaiNoi_QuetNhanCayGoc | null;
}

export class Cutting_HoachToanThuong_QuetNhanCay_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_HoachToanThuong_QuetNhanCay | null;
}

export class themCayNoi_ResponseDTO {
  success: boolean;
  message: string;
  data: Cutting_VaiNoi_ThemCayTiep;
}
