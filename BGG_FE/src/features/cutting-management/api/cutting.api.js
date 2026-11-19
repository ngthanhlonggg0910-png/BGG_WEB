import { postJson } from "../../../shared/api/httpClient";

export async function loadDanhSachBanCat(TKId) {
  return postJson("/api/cutting/CUTTING_LAYDANHSACH_BANCAT_THEO_TKID", {
    TKId: TKId,
  });
}

export async function loadDanhSachPhieuHoachToan(payload) {
  return postJson(
    "/api/cutting/Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android",
    {
      MaHang: payload.MaHang,
      SoPhieu: payload.SoPhieu,
      NgayHoachToan: payload.NgayHoachToan,
      DaHoachToan: payload.DaHoachToan,
      NhomCat: payload.NhomCat,
      BanCat: payload.BanCat,
    },
  );
}

export async function loadDanhSachChiTietPHTTHeoPHTId(
  PhieuHoachToanId,
  MaCay = "",
) {
  return postJson(
    "/api/cutting/wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId",
    {
      PhieuHoachToanId: PhieuHoachToanId,
      MaCay: MaCay,
    },
  );
}

export async function getDanhSachChungLoaiTheoPHTId(PhieuHoachToanId) {
  return postJson("/api/cutting/CUTTING_PhieuHoachToan_Select_ChungLoai", {
    PhieuHoachToanId: PhieuHoachToanId,
  });
}

export async function getDsMauVaiVaMauSanPham(PhieuHoachToanId) {
  return postJson("/api/cutting/Cutting_LayDSMauVaiVaMauSanSanPham", {
    PhieuHoachToanId: PhieuHoachToanId,
  });
}

export async function getDanhSachPOByPHTId(PhieuHoachToanId) {
  return postJson("/api/cutting/Cutting_PhieuHoachToan_DanhSachPO", {
    PhieuHoachToanId: PhieuHoachToanId,
  });
}

export async function getRongSdVaDaiSdTheoMaPhieu(MaPhieu) {
  return postJson(
    "/api/cutting/Cutting_GetInfoRongVaDaiSoDo_TheoMaPhieu_Android",
    {
      MaPhieu: MaPhieu,
    },
  );
}

export async function capNhatHoachToan(payload) {
  return postJson(
    "/api/cutting/Cutting_PhieuHoachToan_CapNhatHachToan_Android",
    {
      PhieuHoachToanId: payload.PhieuHoachToanId,
      DaiBanTraiThucTe: payload.DaiBanTraiThucTe,
      KhoVaiThucTe: payload.KhoVaiThucTe,
      RongSoDo: payload.RongSoDo,
      DaiSoDo: payload.DaiSoDo,
    },
  );
}

export async function layThongTinTrai(PhieuHoachToanId) {
  return postJson("/api/cutting/Cutting_PhieuHoachToan_GetThongTinTrai", {
    PhieuHoachToanId: PhieuHoachToanId,
  });
}

export async function capNhatTraiVai(payload) {
  return postJson("/api/cutting/Cutting_PhieuHoachToan_CapNhatPHT_DaTrai", {
    PhieuHoachToanId: payload.PhieuHoachToanId,
    TenNguoiTrai: payload.TenNguoiTrai,
  });
}

export async function layThongTinKhoaPhieu(PhieuHoachToanId) {
  return postJson("/api/cutting/Cutting_PhieuHoachToan_LayTinhTrangKhoaPhieu", {
    PhieuHoachToanId: PhieuHoachToanId,
  });
}

export async function layTongSoLop(PhieuHoachToanId) {
  return postJson("/api/cutting/Cutting_PhieuHoachToan_LayTinhTrangKhoaPhieu", {
    PhieuHoachToanId: PhieuHoachToanId,
  });
}

export async function khoaPhieu(payload) {
  return postJson("/api/cutting/Cutting_PhieuHoachToan_CapNhatTrangThai", {
    PhieuHoachToanId: payload.PhieuHoachToanId,
    DaHoachToan: payload.DaHoachToan,
    TKId: payload.TKId,
    NguoiKhoaPhieu: payload.NguoiKhoaPhieu,
  });
}

export async function kiemTraCayDeNoi(payload) {
  return postJson("/api/cutting/Cutting_KiemTraCayVaiTruocKhiNoi", {
    PhieuHoachToanId: payload.PhieuHoachToanId,
    ChiTietPhieuHoachToanId: payload.ChiTietPhieuHoachToanId,
    MaCay: payload.MaCay,
  });
}

export async function layThongTinCayGoc(payload) {
  return postJson("/api/cutting/Cutting_VaiNoi_LayThongTinCay", {
    MaCay: payload.MaCay,
    PhieuHoachToanId: payload.PhieuHoachToanId,
  });
}

export async function quetNhanCayGoc(payload) {
  return postJson("/api/cutting/Cutting_VaiNoi_QuetNhanCayGoc", payload);
}

export async function layDanhSachCayNoiBaoGomCayGoc(ChiTietPhieuHoachToanId) {
  return postJson("/api/cutting/Cutting_VaiNoi_LayDanhSachCayNoiBaoGomCayGoc", {
    ChiTietPhieuHoachToanId: ChiTietPhieuHoachToanId,
  });
}

export async function themCayNoi(payload) {
  return postJson("/api/cutting/Cutting_VaiNoi_ThemCayTiep", {
    PhieuHoachToanId: payload.PhieuHoachToanId,
    ChiTietPhieuHoachToanId: payload.ChiTietPhieuHoachToanId,
    MaCay: payload.MaCay,
    MauLot: payload.MauLot ?? "",
    MauVai: payload.MauVai ?? "",
    PO: payload.PO ?? "",
    Yard: payload.Yard ?? 0,
    Met: payload.Met ?? 0,
    SoMetTrai: payload.SoMetTrai ?? 0,
    TieuHaoThucTe: payload.TieuHaoThucTe ?? 0,
    ThucTe: payload.ThucTe ?? 0,
    Thua: payload.Thua ?? 0,
    Thieu: payload.Thieu ?? 0,
    NguyenCay: payload.NguyenCay ?? 0,
    ThuHoi1: payload.ThuHoi1 ?? 0,
    ThuHoi2: payload.ThuHoi2 ?? 0,
    ThuHoi3: payload.ThuHoi3 ?? 0,
    ThuHoi4: payload.ThuHoi4 ?? 0,
    ThuHoi5: payload.ThuHoi5 ?? 0,
    SoBTP: payload.SoBTP ?? 0,
    Cay: payload.Cay ?? null,
  });
}

export async function quetNhanCayHoachToanThuong(payload) {
  return postJson("/api/cutting/Cutting_HoachToanThuong_QuetNhanCay", payload);
}
