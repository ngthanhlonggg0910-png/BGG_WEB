import type {
  lib_DanhSachDanhSachKho_TheoTKId,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId,
  lib_Ro_DanhSachTheoKID_MaHang,
  lib_Ro_DanhSachTheoKID_MaCay_TKId,
} from '../entities/warehouse.entity.js';

export interface IWarehouseRepository {
  //Lấy danh sách kho theo TKId
  getWarehousesByAccountId(
    TkId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId[]>;

  //Tìm theo Rọ/Rổ/Palet
  searchByMaRo(
    KID: number,
    MaHang: string,
    TKId: number,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId[]>;

  //Tìm theo vị trí
  searchByPosition(
    KID: number,
    MaViTri: string,
    TKId: number,
  ): Promise<lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode[]>;

  //Tìm theo mã hàng
  searchByItemCode(
    KID: number,
    MaHang: string,
  ): Promise<lib_Ro_DanhSachTheoKID_MaHang[]>;

  searchMaterialLocations(
    KID: number,
    MaHang: string,
    TKId: number,
  ): Promise<lib_Ro_DanhSachTheoKID_MaCay_TKId[]>;
}
