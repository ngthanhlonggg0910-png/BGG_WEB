import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { ITechnicalDepartmentRepository } from '../../domain/repositories/technical-department.repository.interface.js';
import { ITechnicalDepartmentService } from '../interfaces/technical-department.service.interface.js';
import {
  layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO,
  layTrangThaiTheoBarcodeMau_RequestDTO,
} from '../dtos/technical-department/technical-department-request.dto.js';
import {
  layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO,
  layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO,
  layTrangThaiTheoBarcodeMau_ResponseDTO,
} from '../dtos/technical-department/technical-department-response.dto.js';

@Injectable()
export class TechnicalDepartmentService implements ITechnicalDepartmentService {
  private readonly logger = new Logger(TechnicalDepartmentService.name);

  constructor(
    @Inject('ITechnicalDepartmentRepository')
    private readonly technicalDepartmentRepository: ITechnicalDepartmentRepository,
  ) {}

  async layThongTinGiayDeNghiTheoBarcodeMau(
    dto: layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO,
  ): Promise<layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO> {
    try {
      if (typeof dto.BarcodeMau !== 'string' || !dto.BarcodeMau.trim()) {
        throw new BadRequestException('Barcode mau không hợp lệ');
      }
      const result =
        await this.technicalDepartmentRepository.layThongTinGiayDeNghiTheoBarcodeMau(
          dto.BarcodeMau,
        );
      return {
        success: true,
        message: 'Lấy thông tin giấy đề nghị thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lấy thông tin giấy đề nghị thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi lấy thông tin phiếu đề nghị',
      );
    }
  }

  async layTrangThaiTheoBarcodeMau(
    dto: layTrangThaiTheoBarcodeMau_RequestDTO,
  ): Promise<layTrangThaiTheoBarcodeMau_ResponseDTO> {
    try {
      if (typeof dto.BarcodeMau !== 'string' || !dto.BarcodeMau.trim()) {
        throw new BadRequestException('Barcode mau khong hop le');
      }

      const result =
        await this.technicalDepartmentRepository.layTrangThaiTheoBarcodeMau(
          dto.BarcodeMau,
        );

      return {
        success: true,
        message: 'Lấy trạng thái barcode thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lấy trạng thái BarcodeMau thành công',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi lấy trạng thái BarcodeMau',
      );
    }
  }

  async layDanhSachFileTaiLieuTheoBarcodeMau(
    BarcodeMau: string,
  ): Promise<layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO> {
    try {
      if (typeof BarcodeMau !== 'string' || !BarcodeMau.trim()) {
        throw new BadRequestException('BarcodeMau không hợp lệ');
      }
      const result =
        await this.technicalDepartmentRepository.layDanhSachFileTaiLieuTheoBarcodeMau(
          BarcodeMau,
        );
      return {
        success: true,
        message: 'Lấy danh sách file tài liệu thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Lấy danh sách file tài liệu thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi lấy danh sách tài liệu',
      );
    }
  }
}
