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
