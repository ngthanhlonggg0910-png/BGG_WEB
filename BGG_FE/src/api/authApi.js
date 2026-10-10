const API_URL = "http://localhost:3000/api";

export async function login(tenTaiKhoan, matKhau) {
  const response = await fetch(`/api/auth/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      TenTaiKhoan: tenTaiKhoan,
      MatKhau: matKhau,
    }),
  });

  if (!response.ok) {
    throw new Error("Không thể kết nối đến server");
  }

  const data = await response.json();
  return data;
}
