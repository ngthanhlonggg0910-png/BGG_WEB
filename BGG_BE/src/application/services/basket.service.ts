import { Inject, Injectable } from '@nestjs/common';
import { IBasketLocationService } from '../interfaces/basket.interface.js';
import { BasketLocationRepository } from '../../infrastructure/repositories/basket.js';
import {
  BasketFabricRollDetailRequestDTO,
  BasketFabricRollRequestDTO,
  BasketFindLocationRequestDTO,
  BasketLocationRequestDTO,
} from '../dtos/basket-request.dto.js';
import {
  BaskedLocationResponseDTO,
  BasketFabricRollDetailResponseDTO,
  BasketFabricRollResponseDTO,
  BasketFindLocationResponseDTO,
} from '../dtos/basket-response.dto.js';

@Injectable()
export class BasketLocationService implements IBasketLocationService {
  constructor(
    @Inject('IBasketLocationRepository')
    private readonly basketLocationRepository: BasketLocationRepository,
  ) {}

  async updateLocation(
    dto: BasketLocationRequestDTO,
  ): Promise<BaskedLocationResponseDTO> {
    try {
      const result = await this.basketLocationRepository.updateLocation(
        dto.maRo,
        dto.maViTri,
        dto.nguoiCapNhat,
      );
      return {
        success: result.KetQua === 1,
        message:
          result.KetQua === 1
            ? 'Cập nhật vị trí thành công'
            : result.KetQua === 3
              ? 'Vị trí không tồn tại trong kho'
              : 'Cập nhật thất bại',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật vị trí thất bại',
        data: null,
      };
    }
  }

  async getBasketsByWarehouseLocation(
    dto: BasketFindLocationRequestDTO,
  ): Promise<BasketFindLocationResponseDTO> {
    try {
      const result =
        await this.basketLocationRepository.getBasketsByWarehouseLocation(
          dto.KID,
          dto.VTId,
        );
      return {
        success: true,
        message: 'Lấy danh sách tìm kiếm thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách tìm kiếm thất bại',
        data: [],
      };
    }
  }

  async getBasketFabricRoll(
    dto: BasketFabricRollRequestDTO,
  ): Promise<BasketFabricRollResponseDTO> {
    try {
      const result = await this.basketLocationRepository.getBasketFabricRolls(
        dto.KID,
        dto.MaRo,
        dto.TKId,
      );
      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Lấy danh sách thất bại',
        data: [],
      };
    }
  }

  async getFabricRollsByRo(
    dto: BasketFabricRollDetailRequestDTO,
  ): Promise<BasketFabricRollDetailResponseDTO> {
    const list = await this.basketLocationRepository.getFabricRollsByRo(
      dto.KID,
      dto.MaRo,
      dto.Item,
      dto.Art,
      dto.Lot,
      dto.Mau,
      dto.TKId,
    );

    return {
      success: true,
      message: 'Lấy danh sách cây vải trong rọ thành công',
      data: list,
    };
  }
}
