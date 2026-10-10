import { MaterialLocationRequestDTO } from '../dtos/materiallocation-request.dto.js';
import { MaterialLocationResponseDTO } from '../dtos/materiallocation-response.dto.js';

export interface IMaterialLocationService {
  updateNPL(
    dto: MaterialLocationRequestDTO,
  ): Promise<MaterialLocationResponseDTO>;
}
