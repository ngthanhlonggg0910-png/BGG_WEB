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
