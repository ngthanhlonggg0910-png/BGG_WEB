//Tìm theo Rọ
export class lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO {
  KID: number;
  MaHang: string;
  TKId: number;
}

//Tìm theo vị trí
export class lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO {
  KID: number;
  MaViTri: string;
  TKId: number;
}

//Tìm theo mã hàng
export class lib_Ro_DanhSachTheoKID_MaHang_RequestDTO {
  KID: number;
  MaHang: string;
}

//Tìm theo vật tư
export class lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO {
  KID: number;
  MaHang: string;
  TKId: number;
}

export class lib_Ro_CapNhatViTri_New_RequestDTO {
  maRo: string;
  maViTri: string;
  nguoiCapNhat: string;
}

export class Lib_RO_TimTheoKho_ViTri_RequestDTO {
  KID: number;
  VTId: string;
}

export class lib_Ro_DanhSachCayTheoKID_MaRo_TKId_RequestDTO {
  KID: number;
  MaRo: string;
  TKId: number;
}

export class lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_RequestDTO {
  KID: number;
  MaRo: string;
  Item: string;
  Art: string;
  Lot: string;
  Mau: string;
  TKId: number;
}
