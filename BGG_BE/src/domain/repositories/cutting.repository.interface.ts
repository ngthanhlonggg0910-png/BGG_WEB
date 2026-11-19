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
} from '../entities/cutting.entity.js';

export interface ICuttingRepository {
  loadDanhSachBanCat(TKId: number): Promise<{ TenBanCat: string }[]>;

  loadDanhSachPhieuHoachToan(
    MaHang: string,
    SoPhieu: string,
    NgayHoachToan: Date,
    DaHoachToan: boolean,
    NhomCat: string,
    BanCat: string,
  ): Promise<Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android[]>;

  loadDanhSachChiTietPhieuHoachToanTheoPHTId(
    PhieuHoachToanId: number,
    MaCay: string,
  ): Promise<wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId[]>;

  getChungLoaiByPHTId(
    PhieuHoachToanId: number,
  ): Promise<{ ChungLoai: string }[]>;

  getDsMauVaiVaMauSanPhamTheoPHTId(
    PhieuHoachToanId: number,
  ): Promise<Cutting_LayDSMauVaiVaMauSanSanPham[]>;

  getDanhSachPOByPHTId(PhieuHoachToanId: number): Promise<string[]>;

  getRongSdVaDaiSdTheoMaPhieu(
    MaPhieu: number,
  ): Promise<Cutting_GetInfoRongVaDaiSoDo_TheoMaPhieu_Android[]>;

  getThongTinTraiByPHTId(
    PhieuHoachToanId: number,
  ): Promise<Cutting_PhieuHoachToan_ThongTinTrai | null>;

  getTinhTrangKhoaPhieuByPHTId(
    PhieuHoachToanId: number,
  ): Promise<Cutting_PhieuHoachToan_TinhTrangKhoaPhieu | null>;

  layTongSoLop(
    PhieuHoachToanId: number,
  ): Promise<Cutting_PhieuHoachToan_TongSoLop | null>;

  capNhatHoachToan(
    PhieuHoachToanId: number,
    DaiBanTraiThucTe: number,
    KhoVaiThucTe: number,
    RongSoDo: number,
    DaiSoDo: number,
  ): Promise<void>;

  capNhatTraiVai(PhieuHoachToanId: number, TenNguoiTrai: string): Promise<void>;

  khoaPhieu(
    PhieuHoachToanId: number,
    DaHoachToan: boolean,
    TKId: number,
    NguoiKhoaPhieu: string,
  ): Promise<Cutting_PhieuHoachToan_CapNhatTrangThai | undefined>;

  kiemTraCayDeNoi(
    PhieuHoachToanId: number,
    ChiTietPhieuHoachToanId: number,
    MaCay: string,
  ): Promise<Cutting_KiemTraCayVaiTruocKhiNoi>;

  layThongTinCayGoc(
    MaCay: string,
    PhieuHoachToanId: number,
  ): Promise<Cutting_VaiNoi_LayThongTinCay>;

  layDanhSachCayNoiBaoGomCayGoc(
    ChiTietPhieuHoachToanId: number,
  ): Promise<Cutting_VaiNoi_DanhSachCayNoiBaoGomCayGoc[]>;

  quetNhanCayGoc(dto: {
    PhieuHoachToanId: number;
    MaCay: string;
    MauLot?: string;
    MauVai?: string;
    PO?: string;
    MauSP?: string;
    ChungLoai?: string;
    Yard: number;
    Met: number;
    ThucTe: number;
    Thua: number;
    Thieu: number;
    SoMetTrai: number;
    TieuHaoThucTe: number;
    NguyenCay: number;
    SoBTP: number;
    ThuHoi1: number;
    ThuHoi2: number;
    ThuHoi3: number;
    ThuHoi4: number;
    ThuHoi5: number;
  }): Promise<Cutting_VaiNoi_QuetNhanCayGoc | undefined>;

  quetNhanCayHoachToanThuong(dto: {
    PhieuHoachToanId: number;
    MaCay: string;
    MauLot?: string;
    MauVai?: string;
    PO?: string;
    MauSP?: string;
    ChungLoai?: string;
    Yard?: number;
    Met?: number;
    ThucTe?: number;
    Thua?: number;
    Thieu?: number;
    NguyenCay?: number;
    SoBTP?: number;
    DauKhuc?: number;
    ThayThan?: number;
    Cay?: number | null;
    ThuHoi1?: number;
    ThuHoi2?: number;
    ThuHoi3?: number;
    ThuHoi4?: number;
    ThuHoi5?: number;
    SoLopTrai: number;
    DaiBanTraiThucTe: number;
  }): Promise<Cutting_HoachToanThuong_QuetNhanCay | undefined>;

  themCayNoi(
    ChiTietPhieuHoachToanId: number,
    PhieuHoachToanId: number,
    MaCay: string,
    MauLot: string,
    MauVai: string,
    PO: string,
    Yard: number,
    Met: number,
    SoMetTrai: number,
    TieuHaoThucTe: number,
    ThucTe: number,
    Thua: number,
    Thieu: number,
    NguyenCay: number,
    ThuHoi1: number,
    ThuHoi2: number,
    ThuHoi3: number,
    ThuHoi4: number,
    ThuHoi5: number,
    SoBTP: number,
    Cay: number,
  ): Promise<Cutting_VaiNoi_ThemCayTiep>;
}
