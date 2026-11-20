import {
  BadRequestException,
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
  splitScannedRoll_ResponseDTO,
  deleteScannedRoll_ResponseDTO,
  getMaterialsByQrTrang_ResponseDTO,
  saveMappingBatch_ResponseDTO,
} from '../dtos/mapping-qr-response.dto.js';
import {
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile_RequestDTO,
  wh_DanhSachPhieuGiamDinhTheoThoiGian_RequestDTO,
  deleteScannedRoll_RequestDTO,
  splitScannedRoll_RequestDTO,
  saveMappingBatch_RequestDTO,
} from '../dtos/mapping-qr-request.dto.js';
import { DatabaseService } from '../../infrastructure/database/database.service.js';

const MAX_TEMS_PER_BATCH = 200;

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

  async saveMappingBatch(
    dto: saveMappingBatch_RequestDTO,
  ): Promise<saveMappingBatch_ResponseDTO> {
    const items = Array.isArray(dto?.items) ? dto.items : [];

    if (items.length === 0 || items.length > MAX_TEMS_PER_BATCH) {
      throw new BadRequestException(
        `Cần từ 1 đến ${MAX_TEMS_PER_BATCH} tem trong một lần mapping`,
      );
    }

    for (const [index, item] of items.entries()) {
      const sl = Number(item?.SL);
      if (
        !Number.isSafeInteger(Number(item?.CTPGDId)) ||
        Number(item?.CTPGDId) <= 0 ||
        !Number.isFinite(sl) ||
        sl <= 0 ||
        !String(item?.QrTrangMapping ?? '').trim()
      ) {
        throw new BadRequestException(`Dữ liệu tem thứ ${index + 1} không hợp lệ`);
      }
    }

    try {
      const result = await this.mappingQrRepository.saveMappingBatch(items);

      if (!result.ok) {
        const item = items[result.failedIndex];
        const reason =
          Number(result.failedRow?.KetQua) === 0
            ? 'QR trắng không hợp lệ hoặc không tồn tại'
            : 'Mapping QR thất bại';
        return {
          success: false,
          message: `${reason} (tem ${result.failedIndex + 1}, item ${item.CTPGDId}). Chưa lưu tem nào, vui lòng thử lại.`,
          savedCount: 0,
          data: [],
        };
      }

      return {
        success: true,
        message: `Mapping thành công ${result.rows.length} tem`,
        savedCount: result.rows.length,
        data: result.rows,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi khi Mapping QR theo lô',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Có lỗi khi Mapping QR. Chưa lưu tem nào, vui lòng thử lại.',
      );
    }
  }

  async getScannedRolls(
    CTPGDId: number,
    QrTrangMapping?: string,
  ): Promise<getScannedRolls_ResponseDTO> {
    try {
      const result = await this.mappingQrRepository.getScannedRolls(
        CTPGDId,
        QrTrangMapping,
      );
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

  async getMaterialsByQrTrang(
    Barcode: string,
  ): Promise<getMaterialsByQrTrang_ResponseDTO> {
    try {
      const result =
        await this.mappingQrRepository.getMaterialsByQrTrang(Barcode);
      return {
        success: true,
        message: 'Lấy danh sách vật tư theo tem thùng thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy danh sách vật tư theo tem thùng',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: 'Không thể lấy danh sách vật tư theo tem thùng',
        data: [],
      };
    }
  }

  async updateScannedRoll(
    SL: number,
    CayId: number,
    CTPGDId: number,
  ): Promise<updateScannedRoll_ResponseDTO> {
    const sl = Number(SL);
    if (!Number.isFinite(sl) || sl <= 0) {
      return {
        success: false,
        message: 'Số lượng thực tế phải lớn hơn 0',
        rowsAffected: 0,
      };
    }

    try {
      const result = await this.mappingQrRepository.updateScannedRoll(
        sl,
        Number(CayId),
        Number(CTPGDId),
      );

      if (result.status === 'not_found') {
        return {
          success: false,
          message: 'Không tìm thấy tem cần cập nhật',
          rowsAffected: 0,
        };
      }

      if (result.status === 'below_exported') {
        return {
          success: false,
          message: `Tem này đã xuất kho ${result.soLuongXuat}, số lượng không được nhỏ hơn số lượng đã xuất`,
          rowsAffected: 0,
        };
      }

      return {
        success: true,
        message: 'Cập nhật số lượng tem thành công',
        rowsAffected: 1,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi cập nhật số lượng tem',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Cập nhật số lượng tem thất bại');
    }
  }

  async splitScannedRoll(
    dto: splitScannedRoll_RequestDTO,
  ): Promise<splitScannedRoll_ResponseDTO> {
    try {
      const data = await this.mappingQrRepository.splitScannedRoll(dto);
      return {
        success: true,
        message: `Đã tách thành công thành ${dto.quantities?.length || 2} tem`,
        data,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi khi tách tem/cây',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : 'Có lỗi khi tách tem/cây',
        data: [],
      };
    }
  }

  async deleteScannedRoll(
    dto: deleteScannedRoll_RequestDTO,
  ): Promise<deleteScannedRoll_ResponseDTO> {
    const cayId = Number(dto?.CayId);
    const ctpgdId = Number(dto?.CTPGDId);
    if (!Number.isSafeInteger(cayId) || !Number.isSafeInteger(ctpgdId) || cayId <= 0 || ctpgdId <= 0) {
      throw new BadRequestException('Thiếu CayId/CTPGDId của tem cần xóa');
    }

    const tenTem = dto.MaCay ? ` ${dto.MaCay}` : '';

    try {
      const result = await this.mappingQrRepository.deleteScannedRoll(
        cayId,
        ctpgdId,
      );

      switch (result.status) {
        case 'deleted':
          return { success: true, message: `Đã xóa tem${tenTem}`, rowsAffected: 1 };
        case 'exported':
          return {
            success: false,
            message: `Tem${tenTem} đã xuất kho ${result.soLuongXuat}, không thể xóa`,
            rowsAffected: 0,
          };
        case 'picked':
          return {
            success: false,
            message: `Tem${tenTem} đã được quét vào phiếu soạn hàng, không thể xóa`,
            rowsAffected: 0,
          };
        default:
          return {
            success: false,
            message: 'Không tìm thấy tem cần xóa',
            rowsAffected: 0,
          };
      }
    } catch (error) {
      this.logger.error(
        'Lỗi khi xóa tem',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('Có lỗi khi xóa tem');
    }
  }
}
