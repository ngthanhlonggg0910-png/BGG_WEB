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
