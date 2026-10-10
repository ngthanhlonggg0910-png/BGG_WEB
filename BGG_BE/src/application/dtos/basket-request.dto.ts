export class BasketLocationRequestDTO {
  maRo: string;
  maViTri: string;
  nguoiCapNhat: string;
}

export class BasketFindLocationRequestDTO {
  KID: number;
  VTId: string;
}

export class BasketFabricRollRequestDTO {
  KID: number;
  MaRo: string;
  TKId: number;
}

export class BasketFabricRollDetailRequestDTO {
  KID: number;
  MaRo: string;
  Item: string;
  Art: string;
  Lot: string;
  Mau: string;
  TKId: number;
}
