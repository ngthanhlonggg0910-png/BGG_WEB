import type {
  lib_DanhSachDanhSachKho_TheoTKId,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId,
  lib_Ro_DanhSachTheoKID_MaHang,
  lib_Ro_DanhSachTheoKID_MaCay_TKId,
  BasketLocation,
  RIdAndMaRo,
  BasketFabricRoll,
  BasketFabricRollDetail,
} from '../entities/warehouse.entity.js';

export interface IWarehouseRepository {
  //Lấy danh sách kho theo TKId
  getDanhSachKhoTheoTKId(
    TkId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId[]>;

  //Tìm theo Rọ/Rổ/Palet
  timTheoMaRo(
    KID: number,
    MaHang: string,
    TKId: number,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId[]>;

  //Tìm theo vị trí
  timTheoViTri(
    KID: number,
    MaViTri: string,
    TKId: number,
  ): Promise<lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode[]>;

  //Tìm theo mã hàng
  timTheoMaHang(
    KID: number,
    MaHang: string,
  ): Promise<lib_Ro_DanhSachTheoKID_MaHang[]>;

  timTheoVatTu(
    KID: number,
    MaHang: string,
    TKId: number,
  ): Promise<lib_Ro_DanhSachTheoKID_MaCay_TKId[]>;

  updateBasketLocation(
    maRo: string,
    maViTri: string,
    nguoiCapNhat: string,
  ): Promise<BasketLocation>;

  layDanhSachRoTheoKho(KID: number, VTId: string): Promise<RIdAndMaRo[]>;

  layDanhSachCayVaiTrongRo(
    KID: number,
    MaRo: string,
    TKId: number,
  ): Promise<BasketFabricRoll[]>;

  layDanhSachCayVaiTheoDieuKien(
    KID: number,
    MaRo: string,
    Item: string,
    Art: string,
    Lot: string,
    Mau: string,
    TKId: number,
  ): Promise<BasketFabricRollDetail[]>;
}
