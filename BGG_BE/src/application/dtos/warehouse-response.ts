import type {
  lib_DanhSachDanhSachKho_TheoTKId,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode,
  lib_Ro_DanhSachTheoKID_MaHang,
  lib_Ro_DanhSachTheoKID_MaCay_TKId,
  BasketFabricRoll,
  BasketFabricRollDetail,
} from '../../domain/entities/warehouse.entity.js';
import type {
  BasketLocation,
  RIdAndMaRo,
} from '../../domain/entities/warehouse.entity.js';

export class lib_Ro_CapNhatViTri_New_ResponseDTO {
  success: boolean;
  message: string;
  data: BasketLocation | null;
}

export class Lib_RO_TimTheoKho_ViTri_ResponseDTO {
  success: boolean;
  message: string;
  data: RIdAndMaRo[];
}

export class lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO {
  success: boolean;
  message: string;
  data?: lib_DanhSachDanhSachKho_TheoTKId[];
}

export class lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO {
  success: boolean;
  message: string;
  data?: lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId[];
}

export class lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO {
  success: boolean;
  message: string;
  data?: lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode[];
}

//DTO Response -> tìm theo mã hàng
export class lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO {
  success: boolean;
  message: string;
  data?: lib_Ro_DanhSachTheoKID_MaHang[];
}

//DTO Response -> Tìm theo vật tư
export class lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO {
  success: boolean;
  message: string;
  data: lib_Ro_DanhSachTheoKID_MaCay_TKId[];
}

export class lib_Ro_DanhSachCayTheoKID_MaRo_TKId_ResponseDTO {
  success: boolean;
  message: string;
  data: BasketFabricRoll[];
}

export interface lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_ResponseDTO {
  success: boolean;
  message: string;
  data: BasketFabricRollDetail[];
}
