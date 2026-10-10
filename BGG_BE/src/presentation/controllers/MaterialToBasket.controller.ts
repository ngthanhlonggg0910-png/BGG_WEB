import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { IMaterialLocationService } from '../../application/interfaces/materiallocation-service.js';
import { MaterialLocationRequestDTO } from '../../application/dtos/materiallocation-request.dto.js';
import { MaterialLocationResponseDTO } from '../../application/dtos/materiallocation-response.dto.js';

@Controller('materiallocation')
export class MaterialLocationController {
  constructor(
    @Inject('IMaterialLocationService')
    private readonly materialLocationService: IMaterialLocationService,
  ) {}

  @Post('lib_NPL_CapNhatViTri_New')
  async lib_NPL_CapNhatViTri_New(
    @Body() dto: MaterialLocationRequestDTO,
  ): Promise<MaterialLocationResponseDTO> {
    return await this.materialLocationService.updateNPL(dto);
  }
}
