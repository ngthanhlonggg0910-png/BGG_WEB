const API_URL = "http://localhost:3000/api";

export async function getBasketFabricRolls(KID, MaRo, TKId) {
  const response = await fetch(
    `/api/basketlocation/lib_Ro_DanhSachCayTheoKID_MaRo_TKId`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        KID: KID,
        MaRo: MaRo,
        TKId: TKId,
      }),
    },
  );

  if (!response.ok) throw new Error("Không thể kết nối đến server");
  return await response.json();
}

export async function getBasketsByWarehouseLocation(KID, VTId) {
  const response = await fetch(`/api/basketlocation/Lib_RO_TimTheoKho_ViTri`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      KID: KID,
      VTId: VTId,
    }),
  });

  if (!response.ok) throw new Error("Không thể kết nối đến server");
  return await response.json();
}

export async function getFabricRollsByRo(KID, MaRo, Item, Art, Lot, Mau, TKId) {
  const response = await fetch(
    `/api/basketlocation/lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        KID: KID,
        MaRo: MaRo,
        Item: Item,
        Art: Art,
        Lot: Lot,
        Mau: Mau,
        TKId: TKId,
      }),
    },
  );

  if (!response.ok) throw new Error("Không thể kết nối đến server");
  return await response.json();
}
