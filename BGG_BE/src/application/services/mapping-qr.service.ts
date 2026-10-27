import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import sql from 'mssql';
import { IMappingQrService } from '../interfaces/mapping-qr.service.interface.js';
import type { IMapingQrRepository } from '../../domain/repositories/mapping-qr.interface.repository.js';
import {
  getScannedRolls_ResponseDTO,
  WH_ChiTietPhieuGiamDinh_PGDId_ResponseDTO,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_ResponseDTO,
  wh_DanhSachPhieuGiamDinhTheoThoiGian_ResponseDTO,
  WH_PhieuGiamDinh_GetDanhSachTrangThai_ResponseDTO,
  WH_PhieuGiamDinh_GetData_ByBarcodeKien_ResponseDTO,
  updateScannedRoll_ResponseDTO,
} from '../dtos/mapping-qr-response.dto.js';
import {
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO,
  wh_DanhSachPhieuGiamDinhTheoThoiGian_RequestDTO,
} from '../dtos/mapping-qr-request.dto.js';
import { DatabaseService } from '../../infrastructure/database/database.service.js';

@Injectable()
export class MappingQrService implements IMappingQrService {
  private readonly logger = new Logger(MappingQrService.name);

  constructor(
    @Inject(`IMappingQrRepository`)
    private readonly mappingQrRepository: IMapingQrRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  async getDanhSachTrangThaiPhieuGiamDinh(): Promise<WH_PhieuGiamDinh_GetDanhSachTrangThai_ResponseDTO> {
    try {
      const result =
        await this.mappingQrRepository.getDanhSachTrangThaiPhieuGiamDinh();

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy danh sách Phiếu giám định',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Có lỗi khi lấy danh sách phiếu giám định',
      );
    }
  }

  async getDanhSachPhieuGiamDinhTheoThoiGian(
    dto: wh_DanhSachPhieuGiamDinhTheoThoiGian_RequestDTO,
  ): Promise<wh_DanhSachPhieuGiamDinhTheoThoiGian_ResponseDTO> {
    try {
      const result =
        await this.mappingQrRepository.getDanhSachPhieuGiamDinhTheoThoiGian(
          dto.LoaiGiamDinh,
          dto.KieuThoiGian,
          dto.NgayBatDau,
          dto.NgayKetThuc,
          dto.TrangThai,
        );
      console.log('RESULT FROM REPOSITORY:', result);

      return {
        success: true,
        message: 'Lấy danh sách phiếu kiểm định thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi khi lấy danh sách phiếu kiểm định',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(error);
    }
  }

  async getDanhSachVatTuTheoBarcodeKien(
    Barcode: string,
  ): Promise<WH_PhieuGiamDinh_GetData_ByBarcodeKien_ResponseDTO> {
    try {
      const result =
        await this.mappingQrRepository.getDanhSachVatTuTheoBarcodeKien(Barcode);

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy DS vật tư theo barcode kiện',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi khi lấy DS vật tư theo barcode kiện',
      );
    }
  }

  async getChiTietPhieuGiamDinh(
    PGDId: number,
  ): Promise<WH_ChiTietPhieuGiamDinh_PGDId_ResponseDTO> {
    try {
      const result =
        await this.mappingQrRepository.getChiTietPhieuGiamDinh(PGDId);

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy ds chi tiết phiếu giám định',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi khi lấy ds chi tiết phiếu giám định',
      );
    }
  }

  async saveMapping(
    dto: wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO,
  ): Promise<wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_ResponseDTO> {
    try {
      const result = await this.mappingQrRepository.saveMapping(
        dto.CTPGDId,
        dto.SL,
        dto.TKId,
        dto.TenNguoiTao,
        dto.NguoiTao,
        dto.NoiDung,
        dto.NguoiThayDoi,
        dto.TaiKhoanThayDoi,
        dto.MACAddress,
        dto.ComputerName,
        dto.MaSoKien,
        dto.MaKho,
        dto.SoMet,
        dto.SoYard,
        dto.SoGross,
        dto.QrTrangMapping,
      );

      if (result.KetQua !== 1) {
        return {
          success: false,
          message:
            result.KetQua === 0
              ? 'QR trắng không hợp lệ hoặc không tồn tại'
              : 'Mapping QR thất bại',
          data: result,
        };
      }

      return {
        success: true,
        message: 'Thêm thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi khi Mapping QR',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('Có lỗi khi Mapping QR');
    }
  }

  async getScannedRolls(CTPGDId: number): Promise<getScannedRolls_ResponseDTO> {
    try {
      const result = await this.mappingQrRepository.getScannedRolls(CTPGDId);
      return {
        success: true,
        message: 'Lấy ds thành công',
        data: result,
      };
    } catch (error) {
      console.error('Lỗi lấy danh sách cây:', error);

      return {
        success: false,
        message: 'Lấy danh sách cây thất bại',
        data: [],
      };
    }
  }

  async updateScannedRoll(
    SL: number,
    CayId: number,
    CTPGDId: number,
  ): Promise<updateScannedRoll_ResponseDTO> {
    try {
      const rowsAffected = await this.mappingQrRepository.updateScannedRoll(
        SL,
        CayId,
        CTPGDId,
      );

      if (rowsAffected === 0) {
        return {
          success: false,
          message: 'Không tìm thấy cây cần cập nhật',
          rowsAffected: 0,
        };
      }

      return {
        success: true,
        message: 'Cập nhật số lượng cây thành công',
        rowsAffected,
      };
    } catch (error) {
      console.error('Lỗi cập nhật số lượng cây:', error);

      return {
        success: false,
        message: 'Cập nhật số lượng cây thất bại',
        rowsAffected: 0,
      };
    }
  }
}
