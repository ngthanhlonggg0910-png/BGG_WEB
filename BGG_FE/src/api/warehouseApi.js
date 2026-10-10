const API_URL = "http://localhost:3000/api";

export async function getWarehousesByAccountId(TKId) {
  const response = await fetch(
    `/api/warehouse/lib_DanhSachDanhSachKho_TheoTKId`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        TKId: TKId,
      }),
    },
  );

  if (!response.ok) throw new Error("Không thể kết nối đến server");
  const data = await response.json();
  return data;
}

export async function searchByMaRo({ KID, MaHang, TKId }) {
  const response = await fetch(
    `/api/warehouse/lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        KID: KID,
        MaHang: MaHang,
        TKId: TKId,
      }),
    },
  );

  if (!response.ok) throw new Error("Không thể kết nối đến server");
  return await response.json();
}

export async function searchByPositon({ KID, MaViTri, TKId }) {
  const response = await fetch(
    `/api/warehouse/lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        KID: KID,
        MaViTri: MaViTri,
        TKId: TKId,
      }),
    },
  );

  if (!response.ok) throw new Error("Không thể kết nối đến server");
  return await response.json();
}

//Tìm theo mã hàng
export async function searchByItemCode(KID, MaHang) {
  const response = await fetch(`/api/warehouse/lib_Ro_DanhSachTheoKID_MaHang`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      KID: KID,
      MaHang: MaHang,
    }),
  });

  if (!response.ok) throw new Error("Không thể kết nối đến server");
  return await response.json();
}

//Tìm theo vật tư
export async function searchMaterialLocations(KID, MaHang, TKId) {
  const url = `/api/warehouse/lib_Ro_DanhSachTheoKID_MaCay_TKId`;

  const body = { KID, MaHang, TKId };

  console.log("REQUEST:", url, body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  console.log("RESPONSE:", data);

  return data;
}
