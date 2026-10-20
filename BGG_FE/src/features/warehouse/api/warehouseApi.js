import { postJson } from "../../../shared/api/httpClient";

export async function getWarehousesByAccountId(TKId) {
  return postJson("/api/warehouse/lib_DanhSachDanhSachKho_TheoTKId", {
    TKId: TKId,
  });
}

export async function searchByMaRo({ KID, MaHang, TKId }) {
  return postJson(
    "/api/warehouse/lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId",
    {
      KID: KID,
      MaHang: MaHang,
      TKId: TKId,
    },
  );
}

export async function searchByPositon({ KID, MaViTri, TKId }) {
  return postJson("/api/warehouse/lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode", {
    KID: KID,
    MaViTri: MaViTri,
    TKId: TKId,
  });
}

//Tìm theo mã hàng
export async function searchByItemCode(KID, MaHang) {
  return postJson("/api/warehouse/lib_Ro_DanhSachTheoKID_MaHang", {
    KID: KID,
    MaHang: MaHang,
  });
}

//Tìm theo vật tư
export async function searchMaterialLocations(KID, MaHang, TKId) {
  return postJson("/api/warehouse/lib_Ro_DanhSachTheoKID_MaCay_TKId", {
    KID,
    MaHang,
    TKId,
  });
}

//Tìm theo vị trí
export async function getBasketFabricRolls(KID, MaRo, TKId) {
  return postJson("/api/warehouse/lib_Ro_DanhSachCayTheoKID_MaRo_TKId", {
    KID: KID,
    MaRo: MaRo,
    TKId: TKId,
  });
}

export async function getBasketsByWarehouseLocation(KID, VTId) {
  return postJson("/api/warehouse/Lib_RO_TimTheoKho_ViTri", {
    KID: KID,
    VTId: VTId,
  });
}

export async function getFabricRollsByRo(KID, MaRo, Item, Art, Lot, Mau, TKId) {
  return postJson(
    "/api/warehouse/lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId",
    {
      KID: KID,
      MaRo: MaRo,
      Item: Item,
      Art: Art,
      Lot: Lot,
      Mau: Mau,
      TKId: TKId,
    },
  );
}
