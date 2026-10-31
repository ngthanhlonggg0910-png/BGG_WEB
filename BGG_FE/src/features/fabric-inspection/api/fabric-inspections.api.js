import { postJson } from "../../../shared/api/httpClient";

export async function getFabricInspections(TKId, MaHang = "") {
  return postJson("/api/fabric-inspection/QM_PhieuKiemVai_TheoTKId", {
    TKId: TKId,
    MaHang: MaHang,
  });
}

export async function getCayVaiTheoPhieuKiem(PKVId, MaCay = "") {
  return postJson("/api/fabric-inspection/QM_PhieuKiemVai_CayVai_TheoPKVId", {
    PKVId: PKVId,
    MaCay: MaCay,
  });
}

export async function getDanhSachLoi(ViTri = "") {
  return postJson(
    "/api/fabric-inspection/QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi",
    {
      ViTri: ViTri,
    },
  );
}

export async function getChiTietLoiCay(CTId) {
  return postJson("/api/fabric-inspection/QM_PhieuKiemVai_Cay_ChiTiet", {
    CTId,
  });
}

//THÊM LỖI
export async function themLoiCay(
  CTId,
  MaLoi,
  TenLoi,
  SoDiem,
  SoLoi,
  TongDiem,
  SoDiemTrungBinh,
  TuViTri = 0,
  DenViTri = 0,
  SoYard = 0,
  ViTriKiem = "",
) {
  const payload = {
    CTId,
    MaLoi,
    TenLoi,
    ViTriKiem,
    SoDiem,
    TuViTri,
    DenViTri,
    SoLoi,
    TongDiem,
    SoDiemTrungBinh,
    SoYard,
  };

  return postJson(
    "/api/fabric-inspection/QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi",
    payload,
  );
}

//ĐO KHỔ
export async function doKho(CTId, ViTri, KhoCM, KhoIN) {
  return postJson("/api/fabric-inspection/QM_DoKhoVai_ThemMoi", {
    CTId: CTId,
    ViTri: ViTri,
    KhoCM: KhoCM,
    KhoIN: KhoIN,
  });
}

//LẤY KẾT QUẢ ĐO KHỔ
export async function loadKetQuaDoKho(CTId) {
  return postJson("/api/fabric-inspection/QM_DoKhoVai", {
    CTId: CTId,
  });
}

//CẬP NHẬT CÂY VẢI
export async function capNhatGhiChuHuongXuLyCayVai(CTId, GhiChu, HuongXuLy) {
  return postJson(
    "/api/fabric-inspection/QM_PhieuKiemVai_CayVai_CapNhatGhiChu",
    {
      CTId: CTId,
      GhiChu: GhiChu,
      HuongXuLy: HuongXuLy,
    },
  );
}

//XÓA CÂY VẢI
export async function xoaCayVai(CTId, CayId, MaCayVai) {
  return postJson("/api/fabric-inspection/QM_PhieuKiemVai_CayVai_Delete", {
    CTId: CTId,
    CayId: CayId,
    MaCayVai: MaCayVai,
  });
}

//XONG CÂY
export async function xongCayVai(payload) {
  return postJson(
    "/api/fabric-inspection/QM_PhieuKiemVai_CayVai_XongCay_Android",
    {
      CTId: payload.CTId,
      GhiChu: payload.GhiChu,
      KetQuaKiem: payload.KetQuaKiem,
      KetQuaDoAm: payload.KetQuaDoAm,
      DoAm: payload.DoAm,
      DiemTrungBinh: payload.DiemTrungBinh,
      SoLuongThucTe: payload.SoLuongThucTe,
      NguoiXongCay: payload.NguoiXongCay,
      TrongLuongVai: payload.TrongLuongVai,
    },
  );
}

//TẠO PHIẾU KIỂM AUTO
export async function taoPhieuKiemVaiAuto(TKId, MaCay) {
  return postJson(
    "/api/fabric-inspection/QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile",
    {
      TKId: TKId,
      MaCay: MaCay,
    },
  );
}

//TẠO PHIẾU KIỂM VẢI THỦ CÔNG
export async function taoPhieuKiemVaiThuCong(payload) {
  return postJson("/api/fabric-inspection/QM_PhieuKiemVai_TaoPhieuKiem", {
    TKId: payload.TKId,
    MaHang: payload.MaHang,
    ChungLoai: payload.ChungLoai,
    Item: payload.Item,
    Art: payload.Art,
    TenMau: payload.TenMau,
    NgayKiemVai: payload.NgayKiemVai,
    NhaCungCap: payload.NhaCungCap,
    LOT: payload.LOT,
  });
}

//LẤY SANH SÁCH MÃ HÀNG
export async function layDanhSachMaHang() {
  return postJson("/api/fabric-inspection/DanhSachMaHang");
}

//LẤY DANH SÁCH CHỦNG LOẠI CÓ ITEM
export async function layDanhSachChungLoaiCoItem(MaHang, Item) {
  return postJson("/api/fabric-inspection/layDanhSachChungLoaiCoItem", {
    MaHang: MaHang,
    Item: Item,
  });
}

//LẤY DANH SÁCH CHỦNG LOẠI KO ITEM
export async function layDanhSachChungLoaiKoItem(MaHang) {
  return postJson("/api/fabric-inspection/layDanhSachChungLoaiKoItem", {
    MaHang: MaHang,
  });
}

//Lấy danh sách ITEM
export async function layDanhSachItem(MaHang) {
  return postJson("/api/fabric-inspection/layDanhSachItem", {
    MaHang: MaHang,
  });
}

// Lấy danh sách Mã màu
export async function layDanhSachMaMau(MaHang, Item = "", ChungLoai = "") {
  return postJson("/api/fabric-inspection/layMaMau", {
    MaHang,
    Item,
    ChungLoai,
  });
}

//Lấy danh sách Art
// Lấy danh sách Art
export async function layDanhSachArt(
  MaHang,
  Item = "",
  ChungLoai = "",
  MaMau = "",
) {
  return postJson("/api/fabric-inspection/layArt", {
    MaHang,
    Item,
    ChungLoai,
    MaMau,
  });
}

// Lấy danh sách nhà cung cấp
export async function layDanhSachNhaCungCap() {
  return postJson("/api/fabric-inspection/layNCC");
}

// Lấy danh sách Lot// Lấy danh sách Lot
export async function layLot(
  MaHang,
  Item = "",
  ChungLoai = "",
  MaMau = "",
  Art = "",
) {
  return postJson("/api/fabric-inspection/layLot", {
    MaHang,
    Item,
    ChungLoai,
    MaMau,
    Art,
  });
}

//Thêm cây vải tại phiếu đó
export async function themCayTaiPhieu(payload) {
  return postJson("/api/fabric-inspection/QM_PhieuKiemVai_ThemCayVaoPhieu", {
    TKId: payload.TKId,
    MaCay: payload.MaCay,
    PKVId: payload.PKVId,
  });
}

//Xóa phiếu kiểm vải
export async function xoaPhieuKiem(PKVId) {
  return postJson("/api/fabric-inspection/QM_PhieuKiemVai_XoaPhieu", {
    PKVId: PKVId,
  });
}
