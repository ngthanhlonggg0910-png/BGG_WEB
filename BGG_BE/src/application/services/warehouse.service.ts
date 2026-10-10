import { Inject, Injectable } from '@nestjs/common';
import { IWarehouseService } from '../interfaces/warehouse-service.interface.js';
import type { IWarehouseRepository } from '../../domain/repositories/warehouse.repository.interface.js';

import {
  lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO,
  lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO,
} from '../dtos/warehouse-response.js';
import {
  lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
} from '../dtos/warehouse-request.dto.js';

@Injectable()
export class WarehouseService implements IWarehouseService {
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
  ) {}

  //Lấy danh sách kho theo TKId
  async getWarehousesByAccountId(
    TKId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO> {
    try {
      const list =
        await this.warehouseRepository.getWarehousesByAccountId(TKId);

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: list,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách thất bại',
        data: [],
      };
    }
  }

  //Tìm theo Rọ/Rổ/Palet
  async searchByMaRo(
    dto: lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO> {
    try {
      const list = await this.warehouseRepository.searchByMaRo(
        dto.KID,
        dto.MaHang,
        dto.TKId,
      );
      return {
        success: true,
        message: 'Lấy danh sách tìm kiếm thành công',
        data: list,
      };
    } catch (error) {
      console.log('Lỗi: ', error);
      return {
        success: false,
        message: 'Lấy danh sách tìm kiếm thất bại',
        data: [],
      };
    }
  }

  //TÌm theo vị trí
  async searchByPosition(
    dto: lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO> {
    try {
      const list = await this.warehouseRepository.searchByPosition(
        dto.KID,
        dto.MaViTri,
        dto.TKId,
      );
      return {
        success: true,
        message: 'Lấy danh sách tìm kiếm thành công',
        data: list,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Lấy danh sách tìm kiếm thất bại',
        data: [],
      };
    }
  }

  //Tìm theo mã hàng
  async searchByItemCode(
    dto: lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO> {
    try {
      const result = await this.warehouseRepository.searchByItemCode(
        dto.KID,
        dto.MaHang,
      );
      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách thất bại',
        data: [],
      };
    }
  }

  //TÌm theo vật tư
  async searchMaterialLocations(
    dto: lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO> {
    try {
      const list = await this.warehouseRepository.searchMaterialLocations(
        dto.KID,
        dto.MaHang,
        dto.TKId,
      );
      console.log(list);
      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: list,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách thất bại',
        data: [],
      };
    }
  }
}
