import { getJson, postJson } from "../../../shared/api/httpClient";

const defectSubmissionRequests = new Map();

export async function getAccessoryDefects() {
  return postJson("/api/material-inspection/lib_DSLoi_PhuLieu", {});
}

export async function saveAccessoryInspectionRate(payload) {
  return postJson(
    "/api/material-inspection/wh_chitietphieugiamdinh_capnhat_tilekiem",
    {
      CTPGDId: payload.CTPGDId,
      TiLe: payload.TiLe,
      LoaiTiLe: payload.LoaiTiLe,
    },
  );
}

export async function updateHuongXuLy(Option, CTPGDId) {
  return postJson(
    "/api/material-inspection/wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile",
    {
      Option: Option,
      CTPGDId: CTPGDId,
    },
  );
}

export async function updateTrangThai(payload) {
  return postJson(
    "/api/material-inspection/wh_PhieuGiamDinh_CapNhatTrangThai",
    {
      PGDId: payload.PGDId,
      TrangThai: payload.TrangThai,
      NoiDung: payload.NoiDung,
      NguoiThayDoi: payload.NguoiThayDoi,
      TaiKhoanThayDoi: payload.TaiKhoanThayDoi,
      MACAddress: payload.MACAddress,
      ComputerName: payload.ComputerName,
    },
  );
}

export async function khaiBaoLoiPhuLieu(payload) {
  const requestKey = JSON.stringify({
    CTPGDId: payload.CTPGDId,
    MaLoi: payload.MaLoi,
    SoLuongLoi: payload.SoLuongLoi,
    TenNguoiTao: payload.TenNguoiTao,
  });
  const activeRequest = defectSubmissionRequests.get(requestKey);

  if (activeRequest) return activeRequest;

  const request = postJson(
    "/api/material-inspection/wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile",
    {
      CTPGDId: payload.CTPGDId,
      MaLoi: payload.MaLoi,
      SoLuongLoi: payload.SoLuongLoi,
      TenNguoiTao: payload.TenNguoiTao,
    },
  ).finally(() => defectSubmissionRequests.delete(requestKey));

  defectSubmissionRequests.set(requestKey, request);

  return request;
}

export async function layDanhSachLoiKhaiBao() {
  return getJson(
    `/api/material-inspection/WH_ChiTietPhieuGiamDinh_KiemPhuLieu`,
  );
}

export async function xoaLoiKhaiBao(Id) {
  return postJson(
    `/api/material-inspection/WH_ChiTietPhieuGiamDinh_KiemPhuLieu_Delete`,
    {
      Id: Id,
    },
  );
}
