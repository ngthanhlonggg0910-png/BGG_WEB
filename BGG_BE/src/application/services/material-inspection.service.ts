import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  wh_chitietphieugiamdinh_capnhat_tilekiem_RequestDTO,
  wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_RequestDTO,
  wh_PhieuGiamDinh_CapNhatTrangThai_RequestDTO,
  wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_RequestDTO,
} from '../dtos/material-inspection-request.dto.js';
import type {
  WH_ChiTietPhieuGiamDinh_KiemPhuLieu_Delete_ResponseDTO,
  WH_ChiTietPhieuGiamDinh_KiemPhuLieu_ResponseDTO,
  wh_chitietphieugiamdinh_capnhat_tilekiem_ResponseDTO,
  wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_ResponseDTO,
  wh_PhieuGiamDinh_CapNhatTrangThai_ResponseDTO,
  wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_ResponseDTO,
} from '../dtos/material-inspection-response.dto.js';
import type { lib_DSLoi_PhuLieu_ResponseDTO } from '../dtos/material-inspection-response.dto.js';
import type { IMaterialInspectionService } from '../interfaces/material-inspection.service.interface.js';
import type { IMaterialInspectionRepository } from '../../domain/repositories/material-inspection.repository.interface.js';

@Injectable()
export class MaterialInspectionService implements IMaterialInspectionService {
  private readonly logger = new Logger(MaterialInspectionService.name);
  constructor(
    @Inject('IMaterialInspectionRepository')
    private readonly materialInspectionRepository: IMaterialInspectionRepository,
  ) {}

  async getAccessoryDefects(): Promise<lib_DSLoi_PhuLieu_ResponseDTO> {
    const data = await this.materialInspectionRepository.getAccessoryDefects();

    return {
      success: true,
      message: 'Lấy danh sách lỗi phụ liệu thành công',
      data,
    };
  }

  async getDeclaredAccessoryDefects(): Promise<WH_ChiTietPhieuGiamDinh_KiemPhuLieu_ResponseDTO> {
    const data =
      await this.materialInspectionRepository.getDeclaredAccessoryDefects();

    return {
      success: true,
      message: 'Lấy danh sách lỗi phụ liệu đã khai báo thành công',
      data,
    };
  }

  async deleteDeclaredAccessoryDefect(
    id: number,
  ): Promise<WH_ChiTietPhieuGiamDinh_KiemPhuLieu_Delete_ResponseDTO> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException('Id phải là số nguyên dương hợp lệ');
    }

    const rowsAffected =
      await this.materialInspectionRepository.deleteDeclaredAccessoryDefect(id);

    if (rowsAffected === 0) {
      throw new NotFoundException(`Không tìm thấy lỗi phụ liệu có Id ${id}`);
    }

    return {
      success: true,
      message: 'Xóa lỗi phụ liệu đã khai báo thành công',
      rowsAffected,
    };
  }

  async updateInspectionRate(
    dto: wh_chitietphieugiamdinh_capnhat_tilekiem_RequestDTO,
  ): Promise<wh_chitietphieugiamdinh_capnhat_tilekiem_ResponseDTO> {
    const tiLe = Number(dto?.TiLe);
    const ctpGdId = Number(dto?.CTPGDId);

    if (!Number.isFinite(tiLe)) {
      throw new BadRequestException('TiLe phải là một số hợp lệ');
    }

    if (
      typeof dto?.LoaiTiLe !== 'string' ||
      dto.LoaiTiLe.trim().length === 0 ||
      dto.LoaiTiLe.length > 250
    ) {
      throw new BadRequestException(
        'LoaiTiLe là chuỗi bắt buộc, tối đa 250 ký tự',
      );
    }

    if (!Number.isSafeInteger(ctpGdId) || ctpGdId <= 0) {
      throw new BadRequestException('CTPGDId phải là số nguyên dương hợp lệ');
    }

    await this.materialInspectionRepository.updateInspectionRate(
      tiLe,
      dto.LoaiTiLe.trim(),
      ctpGdId,
    );

    return {
      success: true,
      message: 'Cập nhật tỉ lệ kiểm thành công',
    };
  }

  async updateHuongXuLy(
    dto: wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_RequestDTO,
  ): Promise<wh_KiemPhuLieu_CapNhatHuongXuLy_Mobile_ResponseDTO> {
    try {
      const result = await this.materialInspectionRepository.updateHuongXuLy(
        dto.Option,
        dto.CTPGDId,
      );

      return {
        success: result.KetQua === 1,
        message: 'Cập nhật hướng xử lý thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi cập nhật hướng xử lý',
        error instanceof Error ? error.stack : String(error),
      );

      return {
        success: false,
        message: 'Cập nhật hướng xử lý thất bại',
        data: null,
      };
    }
  }

  async updateTrangThai(
    dto: wh_PhieuGiamDinh_CapNhatTrangThai_RequestDTO,
  ): Promise<wh_PhieuGiamDinh_CapNhatTrangThai_ResponseDTO> {
    // Kiểm tra dữ liệu đầu vào
    if (
      !Number.isSafeInteger(dto.PGDId) ||
      dto.PGDId <= 0 ||
      typeof dto.TrangThai !== 'string' ||
      !dto.TrangThai.trim() ||
      typeof dto.NoiDung !== 'string' ||
      typeof dto.NguoiThayDoi !== 'string' ||
      typeof dto.TaiKhoanThayDoi !== 'string' ||
      typeof dto.MACAddress !== 'string' ||
      typeof dto.ComputerName !== 'string'
    ) {
      return {
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ hoặc thiếu tham số',
        data: null,
      };
    }
    try {
      const result = await this.materialInspectionRepository.updateTrangThai(
        dto.PGDId,
        dto.TrangThai,
        dto.NoiDung,
        dto.NguoiThayDoi,
        dto.TaiKhoanThayDoi,
        dto.MACAddress,
        dto.ComputerName,
      );

      return {
        success: result?.KetQua === 1,
        message:
          result?.KetQua === 1
            ? 'Xác nhận phiếu giám định thành công'
            : 'Xác nhận phiếu giám định thất bại',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Xác nhận phiếu giám định thất bại',
        error instanceof Error ? error.stack : String(error),
      );

      return {
        success: false,
        message: 'Xác nhận phiếu giám định thất bại',
        data: null,
      };
    }
  }

  async khaiBaoLoiPhuLieu(
    dto: wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_RequestDTO,
  ): Promise<wh_UpdateOrInsertKiemPhuLieu_KhaiBaoLoiPL_Mobile_ResponseDTO> {
    if (
      !Number.isSafeInteger(dto.CTPGDId) ||
      dto.CTPGDId <= 0 ||
      !Number.isFinite(dto.SoLuongLoi) ||
      dto.SoLuongLoi <= 0 ||
      typeof dto.MaLoi !== 'string' ||
      typeof dto.TenNguoiTao !== 'string'
    ) {
      return {
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ hoặc thiếu tham số',
        data: null,
      };
    }

    try {
      const result = await this.materialInspectionRepository.khaiBaoLoiPhuLieu(
        dto.CTPGDId,
        dto.MaLoi,
        dto.SoLuongLoi,
        dto.TenNguoiTao,
      );

      return {
        success: result?.KetQua === 1,
        message:
          result?.KetQua === 1
            ? 'Khai báo lỗi phụ liệu thành công'
            : 'Khai báo lỗi phụ liệu thất bại',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Khai báo lỗi thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: 'Khai báo lỗi không thành công',
        data: null,
      };
    }
  }
}
