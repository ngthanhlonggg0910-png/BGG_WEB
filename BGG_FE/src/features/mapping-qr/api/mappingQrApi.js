import { getJson, postJson } from "../../../shared/api/httpClient";

export async function getDanhSachTrangThaiPhieuGiamDinh() {
  return getJson(`/api/mapping-qr/WH_PhieuGiamDinh_GetDanhSachTrangThai`);
}

export async function getDanhSachPhieuGiamDinhTheoThoiGian(payload) {
  return postJson("/api/mapping-qr/wh_DanhSachPhieuGiamDinhTheoThoiGian", {
    LoaiGiamDinh: payload.LoaiGiamDinh,
    KieuThoiGian: payload.KieuThoiGian,
    NgayBatDau: payload.NgayBatDau,
    NgayKetThuc: payload.NgayKetThuc,
    TrangThai: payload.TrangThai,
  });
}

export async function getDanhSachVatTuTheoBarcodeKien(Barcode) {
  return postJson("/api/mapping-qr/WH_PhieuGiamDinh_GetData_ByBarcodeKien", {
    Barcode: Barcode,
  });
}

export async function getChiTietPhieuGiamDinh(pGDId) {
  return postJson("/api/mapping-qr/WH_ChiTietPhieuGiamDinh_PGDId", {
    PGDId: pGDId,
  });
}

export async function saveMapping(payload) {
  return postJson(
    "/api/mapping-qr/wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile",
    payload,
  );
}
