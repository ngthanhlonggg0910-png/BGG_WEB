import type { MaterialLocation } from '../entities/MaterialToBasket.js';

export interface IMaterialLocationRepository {
  updateNPL(
    maRo: string,
    maNPL: string,
    nguoiCapNhat: string,
  ): Promise<MaterialLocation>;
}
