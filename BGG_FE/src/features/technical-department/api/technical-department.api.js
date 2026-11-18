import { postJson } from "../../../shared/api/httpClient";

export async function layThongTinGiayDeNghiTheoBarcodeMau(BarcodeMau) {
  return postJson("/api/technical-department/TEC_GetGiayDeNghi_ByBarcodeMau", {
    BarcodeMau: BarcodeMau,
  });
}
