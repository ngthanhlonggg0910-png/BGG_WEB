import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IWarehouseService } from '../interfaces/warehouse-service.interface.js';
import type { IWarehouseRepository } from '../../domain/repositories/warehouse.repository.interface.js';

import {
  lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO,
  lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO,
  lib_Ro_DanhSachCayTheoKID_MaRo_TKId_ResponseDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_ResponseDTO,
  lib_Ro_CapNhatViTri_New_ResponseDTO,
  Lib_RO_TimTheoKho_ViTri_ResponseDTO,
} from '../dtos/warehouse-response.js';
import {
  lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
  lib_Ro_CapNhatViTri_New_RequestDTO,
  Lib_RO_TimTheoKho_ViTri_RequestDTO,
  lib_Ro_DanhSachCayTheoKID_MaRo_TKId_RequestDTO,
  lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_RequestDTO,
} from '../dtos/warehouse-request.dto.js';

@Injectable()
export class WarehouseService implements IWarehouseService {
  private readonly logger = new Logger(WarehouseService.name);

  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
  ) {}

  //Lấy danh sách kho theo TKId
  async getDanhSachKhoTheoTKId(
    TKId: number,
  ): Promise<lib_DanhSachDanhSachKho_TheoTKId_ResponseDTO> {
    try {
      const list = await this.warehouseRepository.getDanhSachKhoTheoTKId(TKId);

      if (!list || list.length === 0)
        throw new NotFoundException('Không tìm thấy danh sách kho');

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: list,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi lấy danh sách kho',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Lấy danh sách kho thất bại');
    }
  }

  //Tìm theo Rọ/Rổ/Palet
  async TimTheoMaRo(
    dto: lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ItemArtLotMau_TKId_ResponseDTO> {
    try {
      const list = await this.warehouseRepository.timTheoMaRo(
        dto.KID,
        dto.MaHang,
        dto.TKId,
      );

      if (!list || list.length === 0)
        throw new NotFoundException('Không tìm thấy danh sách theo Mã Rọ');

      return {
        success: true,
        message: 'Lấy danh sách tìm kiếm thành công',
        data: list,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi lấy danh sách tìm theo mã rọ',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Có lỗi hệ thống khi lấy danh sách theo mã rọ ',
      );
    }
  }

  //TÌm theo vị trí
  async TimTheoViTri(
    dto: lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoMaViTri_TimPOVaSizeCode_ResponseDTO> {
    try {
      const list = await this.warehouseRepository.timTheoViTri(
        dto.KID,
        dto.MaViTri,
        dto.TKId,
      );

      if (!list || list.length === 0)
        throw new NotFoundException('Không tìm thấy danh sách tìm theo Vị trí');

      return {
        success: true,
        message: 'Lấy danh sách tìm kiếm thành công',
        data: list,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi tìm kiếm theo vị trí',
        error instanceof Error ? error.stack : String(Error),
      );
      throw new InternalServerErrorException(
        'Có lỗi hệ thống khi tìm theo vị trí',
      );
    }
  }

  //Tìm theo mã hàng
  async TimTheoMaHang(
    dto: lib_Ro_DanhSachTheoKID_MaHang_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaHang_ResponseDTO> {
    try {
      const result = await this.warehouseRepository.timTheoMaHang(
        dto.KID,
        dto.MaHang,
      );

      if (!result || result.length === 0)
        throw new NotFoundException('Không tìm thấy danh sách theo mã hàng');

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi tìm kiếm theo mã hàng',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Có lỗi hệ thống khi tìm theo mã hàng',
      );
    }
  }

  //TÌm theo vật tư
  async TimTheoVatTu(
    dto: lib_Ro_DanhSachTheoKID_MaCay_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaCay_TKId_ResponseDTO> {
    try {
      const list = await this.warehouseRepository.timTheoVatTu(
        dto.KID,
        dto.MaHang,
        dto.TKId,
      );

      if (!list || list.length === 0)
        throw new NotFoundException('Không tìm thấy danh sách vật tư');

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: list,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi tìm kiếm vật tư',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Có lỗi hệ thống khi tìm danh sách vật tư',
      );
    }
  }

  async updateBasketLocation(
    dto: lib_Ro_CapNhatViTri_New_RequestDTO,
  ): Promise<lib_Ro_CapNhatViTri_New_ResponseDTO> {
    try {
      const result = await this.warehouseRepository.updateBasketLocation(
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
    } catch {
      return {
        success: false,
        message: 'Cập nhật vị trí thất bại',
        data: null,
      };
    }
  }

  async layDanhSachRoTheoKho(
    dto: Lib_RO_TimTheoKho_ViTri_RequestDTO,
  ): Promise<Lib_RO_TimTheoKho_ViTri_ResponseDTO> {
    try {
      const result = await this.warehouseRepository.layDanhSachRoTheoKho(
        dto.KID,
        dto.VTId,
      );
      return {
        success: true,
        message: 'Lấy danh sách tìm kiếm thành công',
        data: result,
      };
    } catch {
      return {
        success: false,
        message: 'Lấy danh sách tìm kiếm thất bại',
        data: [],
      };
    }
  }

  //Lấy danh sách cây vải trong rổ
  async layDanhSachCayVaiTrongRo(
    dto: lib_Ro_DanhSachCayTheoKID_MaRo_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachCayTheoKID_MaRo_TKId_ResponseDTO> {
    try {
      const result = await this.warehouseRepository.layDanhSachCayVaiTrongRo(
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
      console.error('GET BASKET FABRIC ROLLS ERROR:', error);
      return {
        success: false,
        message: 'Lấy danh sách thất bại',
        data: [],
      };
    }
  }

  async layDanhSachCayVaiTheoDieuKien(
    dto: lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_RequestDTO,
  ): Promise<lib_Ro_DanhSachTheoKID_MaRo_ArtLotMau_Cay_TKId_ResponseDTO> {
    try {
      const result =
        await this.warehouseRepository.layDanhSachCayVaiTheoDieuKien(
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
        message: 'Lấy danh sách cây vải trong rổ thành công',
        data: result,
      };
    } catch (error) {
      console.error('GET FABRIC ROLLS BY BASKET ERROR:', error);
      return {
        success: false,
        message: 'Lấy danh sách cây vải trong rổ thất bại',
        data: [],
      };
    }
  }
}
