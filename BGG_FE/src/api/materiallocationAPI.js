const API_URL = "http://localhost:3000/api";

export async function updateMaterialLocation(maRo, maNPL, nguoiCapNhat) {
  const response = await fetch(
    `/api/materiallocation/lib_NPL_CapNhatViTri_New`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maRo: maRo,
        maNPL: maNPL,
        nguoiCapNhat: nguoiCapNhat,
      }),
    },
  );

  if (!response.ok) throw new Error("Không thể kết nối đến server");
  const data = await response.json();
  return data;
}
