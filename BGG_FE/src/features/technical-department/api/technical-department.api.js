import { getJson, postJson } from "../../../shared/api/httpClient";

export async function layThongTinGiayDeNghiTheoBarcodeMau(BarcodeMau) {
  return postJson("/api/technical-department/TEC_GetGiayDeNghi_ByBarcodeMau", {
    BarcodeMau: BarcodeMau,
  });
}

export async function layTrangThaiTheoBarcodeMau(BarcodeMau) {
  return postJson("/api/technical-department/TEC_GetTrangThai_ByBarCodeMau", {
    BarcodeMau: BarcodeMau,
  });
}

export async function layTenFileTrongFolder() {
  return getJson("/api/technical-department/files");
}

export async function layFileTheoTen(fileName) {
  return getJson(`/api/technical-department/files/${fileName}`);
}

export async function layDanhSachFileTaiLieuTheoBarcodeMau(BarcodeMau) {
  return postJson(
    "/api/technical-department/TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau",
    {
      BarcodeMau: BarcodeMau,
    },
  );
}

export async function getTrangThai(BarcodeMau, Loai) {
  return postJson(
    "/api/technical-department/TEC_GetTrangThai_ByBarcodeMauAndLoai",
    {
      BarcodeMau: BarcodeMau,
      Loai: Loai,
    },
  );
}

export async function capNhatTrangThaiBarcodeMau(payload) {
  return postJson(
    "/api/technical-department/TEC_BarcodeMau_UpdateTrangThai_Mobile",
    payload,
  );
}

export async function layDanhSachLoi() {
  return getJson("/api/technical-department/TEC_KiemMau_DanhSachLoi");
}

export async function kiemTraTonTai(payload) {
  return postJson(
    "/api/technical-department/TEC_KiemMau_Master_KiemTraTonTai",
    payload,
  );
}

export async function themDongKiemMau(payload) {
  return postJson(
    "/api/technical-department/TEC_KiemMau_Detail_Insert",
    payload,
  );
}

export async function layDanhSachLoiKiemMau(BarcodeMau) {
  return postJson("/api/technical-department/TEC_KiemMau_Detail_Select", {
    BarcodeMau: BarcodeMau,
  });
}
