import { postJson } from "../../../shared/api/httpClient";

export async function login(tenTaiKhoan, matKhau) {
  return postJson("/api/auth/login", {
    TenTaiKhoan: tenTaiKhoan,
    MatKhau: matKhau,
  });
}
