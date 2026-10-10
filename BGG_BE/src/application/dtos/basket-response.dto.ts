import { BasketFabricRoll, RIdAndMaRo } from '../../domain/entities/basket.js';

export class BaskedLocationResponseDTO {
  success: boolean;
  message: string;
  data: {
    KetQua: number;
  } | null;
}

export class BasketFindLocationResponseDTO {
  success: boolean;
  message: string;
  data: RIdAndMaRo[];
}

export class BasketFabricRollResponseDTO {
  success: boolean;
  message: string;
  data: BasketFabricRoll[];
}

import type { BasketFabricRollDetail } from '../../domain/entities/basket.js';

export interface BasketFabricRollDetailResponseDTO {
  success: boolean;
  message: string;
  data: BasketFabricRollDetail[];
}
