import { MaterialLocation } from '../../domain/entities/MaterialToBasket.js';

export class MaterialLocationResponseDTO {
  success: boolean;
  message: string;
  data: MaterialLocation | null;
}
