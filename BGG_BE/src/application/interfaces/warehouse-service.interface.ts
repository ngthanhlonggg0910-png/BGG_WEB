import type {
  lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO,
  lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO,
  lib_Ro_DanhSachCayTheoKID_MaRo_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_ResponseDTO,
  lib_Ro_CapNhatViTri_New_ResponseDTO,
  Lib_RO_TimTheoKho_ViTri_ResponseDTO,
} from '../dtos/warehouse-response.js';
import type {
  lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
  lib_Ro_CapNhatViTri_New_RequestDTO,
  Lib_RO_TimTheoKho_ViTri_RequestDTO,
  lib_Ro_DanhSachCayTheoKID_MaRo_TKId_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_RequestDTO,
} from '../dtos/warehouse-request.dto.js';

export interface IWarehouseService {
  getDanhSachKhoTheoTKId(
    TKId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO>;

  //Tìm Rọ/Rổ/Palet
  TimTheoMaRo(
    dto: lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO>;

  //Tìm theo vị trí
  TimTheoViTri(
    dto: lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO>;

  //Tìm theo mã hàng
  TimTheoMaHang(
    dto: lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO>;

  //Tìm theo vật tư
  TimTheoVatTu(
    dto: lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO>;

  updateBasketLocation(
    dto: lib_Ro_CapNhatViTri_New_RequestDTO,
  ): Promise<lib_Ro_CapNhatViTri_New_ResponseDTO>;

  layDanhSachRoTheoKho(
    dto: Lib_RO_TimTheoKho_ViTri_RequestDTO,
  ): Promise<Lib_RO_TimTheoKho_ViTri_ResponseDTO>;

  layDanhSachCayVaiTrongRo(
    dto: lib_Ro_DanhSachCayTheoKID_MaRo_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachCayTheoKID_MaRo_TKId_ResponseDTO>;

  layDanhSachCayVaiTheoDieuKien(
    dto: lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_ResponseDTO>;
}
