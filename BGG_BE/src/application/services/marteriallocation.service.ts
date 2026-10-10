import { Inject, Injectable } from '@nestjs/common';
import { IMaterialLocationService } from '../interfaces/materiallocation-service.js';
import type { IMaterialLocationRepository } from '../../domain/repositories/MaterialToBasket.interface.js';

import { MaterialLocationRequestDTO } from '../dtos/materiallocation-request.dto.js';

import { MaterialLocationResponseDTO } from '../dtos/materiallocation-response.dto.js';
import { MaterialLocation } from '../../domain/entities/MaterialToBasket.js';

@Injectable()
export class MaterialLocationService implements IMaterialLocationService {
  constructor(
    @Inject(`IMaterialLocationRepository`)
    private readonly materialLocationRepository: IMaterialLocationRepository,
  ) {}

  async updateNPL(
    dto: MaterialLocationRequestDTO,
  ): Promise<MaterialLocationResponseDTO> {
    try {
      const result: MaterialLocation =
        await this.materialLocationRepository.updateNPL(
          dto.maRo,
          dto.maNPL,
          dto.nguoiCapNhat,
        );
      console.log('RESULT:', result);
      return {
        success: result.KetQua === 1,
        message:
          result.KetQua === 1
            ? 'Cập nhật thành công'
            : result.KetQua === 3
              ? 'Vị trí không tồn tại'
              : 'Cập nhật thất bại',
        data: result,
      };
    } catch (error) {
      console.error('UPDATE LOCATION ERROR:', error);
      return {
        success: false,
        message: 'Cập nhật thất bại',
        data: null,
      };
    }
  }
}
