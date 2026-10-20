import { postJson } from "../../../shared/api/httpClient";

export async function updateMaterialLocation(maRo, maNPL, nguoiCapNhat) {
  return postJson("/api/materiallocation/lib_NPL_CapNhatViTri_New", {
    maRo: maRo,
    maNPL: maNPL,
    nguoiCapNhat: nguoiCapNhat,
  });
}
