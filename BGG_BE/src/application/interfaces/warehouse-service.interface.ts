import type {
  lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO,
  lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO,
} from '../dtos/warehouse-response.js';
import type {
  lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
} from '../dtos/warehouse-request.dto.js';

export interface IWarehouseService {
  getWarehousesByAccountId(
    TKId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO>;

  //Tìm Rọ/Rổ/Palet
  searchByMaRo(
    dto: lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO>;

  //Tìm theo vị trí
  searchByPosition(
    dto: lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO>;

  //Tìm theo mã hàng
  searchByItemCode(
    dto: lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO>;

  //Tìm theo vật tư
  searchMaterialLocations(
    dto: lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO>;
}
