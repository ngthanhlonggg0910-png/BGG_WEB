import type {
  BasketFabricRoll,
  BasketFabricRollDetail,
  BasketLocation,
} from '../entities/basket.js';
import { RIdAndMaRo } from '../entities/basket.js';

export interface IBasketLocationRepository {
  updateLocation(
    maRo: string,
    maViTri: string,
    nguoiCapNhat: string,
  ): Promise<BasketLocation>;

  //Lấy ra Id và MaRo
  getBasketsByWarehouseLocation(
    KID: number,
    VTId: string,
  ): Promise<RIdAndMaRo[]>;

  //Lấy danh sách cây vải trong rổ
  getBasketFabricRolls(
    KID: number,
    MaRo: string,
    TKId: number,
  ): Promise<BasketFabricRoll[]>;

  getFabricRollsByRo(
    KID: number,
    MaRo: string,
    Item: string,
    Art: string,
    Lot: string,
    Mau: string,
    TKId: number,
  ): Promise<BasketFabricRollDetail[]>;
}
