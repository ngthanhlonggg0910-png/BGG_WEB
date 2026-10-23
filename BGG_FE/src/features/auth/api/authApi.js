import { postJson } from "../../../shared/api/httpClient";

export async function login(tenTaiKhoan, matKhau) {
  return postJson("/api/auth/login", {
    TenTaiKhoan: tenTaiKhoan,
    MatKhau: matKhau,
  });
}

//Login -> chuyển đến web chữ ký
export async function loginToSignature(username, password) {
  // Lấy CSRF token
  const csrfRes = await fetch("/api/csrf", {
    credentials: "include",
  });

  if (!csrfRes.ok) {
    throw new Error("Không lấy được CSRF token");
  }

  const { token } = await csrfRes.json();

  // Đăng nhập web ký duyệt
  const loginRes = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      RequestVerificationToken: token,
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!loginRes.ok) {
    throw new Error("Đăng nhập ký duyệt thất bại");
  }

  return loginRes.json();
}
