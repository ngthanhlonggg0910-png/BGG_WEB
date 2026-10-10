import {
  BasketFabricRollRequestDTO,
  BasketFindLocationRequestDTO,
  BasketLocationRequestDTO,
  BasketFabricRollDetailRequestDTO,
} from '../dtos/basket-request.dto.js';
import {
  BaskedLocationResponseDTO,
  BasketFabricRollResponseDTO,
  BasketFindLocationResponseDTO,
  BasketFabricRollDetailResponseDTO,
} from '../dtos/basket-response.dto.js';
export interface IBasketLocationService {
  updateLocation(
    dto: BasketLocationRequestDTO,
  ): Promise<BaskedLocationResponseDTO>;

  getBasketsByWarehouseLocation(
    dto: BasketFindLocationRequestDTO,
  ): Promise<BasketFindLocationResponseDTO>;

  getBasketFabricRoll(
    dto: BasketFabricRollRequestDTO,
  ): Promise<BasketFabricRollResponseDTO>;

  getFabricRollsByRo(
    dto: BasketFabricRollDetailRequestDTO,
  ): Promise<BasketFabricRollDetailResponseDTO>;
}
