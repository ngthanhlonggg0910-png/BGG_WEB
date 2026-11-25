import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import {
  capNhatTrangThai_TEC_BarcodeMau_RequestDTO,
  TEC_BarcodeMau_SelectThongTinKiemMau_RequestDTO,
  layDanhSachFileTaiLieuTheoBarcodeMau_RequestDTO,
  layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO,
  layTrangThaiTheoBarcodeMau_RequestDTO,
  layTrangThaiTheoLoaiVaBarcodeMau_RequestDTO,
  TEC_KiemMau_Detail_Insert_RequestDTO,
  TEC_KiemMau_Detail_Select_RequestDTO,
  TEC_KiemMau_Detail_Delete_RequestDTO,
  TEC_KiemMau_Detail_Update_RequestDTO,
  TEC_KiemMau_Master_KiemTraTonTai_RequestDTO,
} from '../dtos/technical-department/technical-department-request.dto.js';

import {
  capNhatTrangThai_TEC_BarcodeMau_ResponseDTO,
  TEC_BarcodeMau_SelectThongTinKiemMau_ResponseDTO,
  layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO,
  layDanhSachLoi_ResponseDTO,
  layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO,
  layTrangThaiTheoBarcodeMau_ResponseDTO,
  layTrangThaiTheoLoaiVaBarcodeMau_ResponseDTO,
  TEC_KiemMau_Detail_Insert_ResponseDTO,
  TEC_KiemMau_Detail_Select_ResponseDTO,
  TEC_KiemMau_Detail_Delete_ResponseDTO,
  TEC_KiemMau_Detail_Update_ResponseDTO,
  TEC_KiemMau_Master_KiemTraTonTai_ResponseDTO,
} from '../dtos/technical-department/technical-department-response.dto.js';

import type { ITechnicalDepartmentRepository } from '../../domain/repositories/technical-department.repository.interface.js';
import { ITechnicalDepartmentService } from '../interfaces/technical-department.service.interface.js';
import {
  deleteImageIfSafe,
  saveImage,
} from '../../shared/utils/save-image.util.js';

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

  async layTrangThaiTheoLoaiVaBarcodeMau(
    dto: layTrangThaiTheoLoaiVaBarcodeMau_RequestDTO,
  ): Promise<layTrangThaiTheoLoaiVaBarcodeMau_ResponseDTO> {
    try {
      if (typeof dto.BarcodeMau !== 'string' || !dto.BarcodeMau.trim())
        throw new BadRequestException('BarcodeMau không hợp lệ');
      if (typeof dto.Loai !== 'string' || !dto.Loai.trim())
        throw new BadRequestException('Loại không hợp lệ');
      const result =
        await this.technicalDepartmentRepository.layTrangThaiTheoLoaiVaBarcodeMau(
          dto.BarcodeMau,
          dto.Loai,
        );
      return {
        success: true,
        message: 'Lấy trạng thái thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      this.logger.error(
        'Lấy trạng thái thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống ko thể lấy trạng thái',
      );
    }
  }

  async capNhatTrangThai_TEC_BarcodeMau(
    dto: capNhatTrangThai_TEC_BarcodeMau_RequestDTO,
  ): Promise<capNhatTrangThai_TEC_BarcodeMau_ResponseDTO> {
    try {
      if (typeof dto.TrangThai !== 'string' || !dto.TrangThai.trim()) {
        throw new BadRequestException('Trạng thái không hợp lệ');
      }
      if (dto.isSua !== undefined && typeof dto.isSua !== 'boolean') {
        throw new BadRequestException('isSua không hợp lệ');
      }
      if (typeof dto.BarcodeMau !== 'string' || !dto.BarcodeMau.trim()) {
        throw new BadRequestException('BarcodeMau không hợp lệ');
      }
      if (typeof dto.LoaiKiemMau !== 'string' || !dto.LoaiKiemMau.trim()) {
        throw new BadRequestException('Loại kiểm không hợp lệ');
      }
      const result =
        await this.technicalDepartmentRepository.capNhatTrangThai_TEC_BarcodeMau(
          dto.TrangThai,
          dto.isSua,
          dto.BarcodeMau,
          dto.LoaiKiemMau,
        );
      return {
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Cập nhật trạng thái không thành công',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống không thể cập nhật trạng thái',
      );
    }
  }

  async TEC_BarcodeMau_SelectThongTinKiemMau(
    dto: TEC_BarcodeMau_SelectThongTinKiemMau_RequestDTO,
  ): Promise<TEC_BarcodeMau_SelectThongTinKiemMau_ResponseDTO> {
    try {
      if (typeof dto.BarcodeMau !== 'string' || !dto.BarcodeMau.trim()) {
        throw new BadRequestException('BarcodeMau không hợp lệ');
      }
      const result =
        await this.technicalDepartmentRepository.TEC_BarcodeMau_SelectThongTinKiemMau(
          dto.BarcodeMau,
        );
      return {
        success: true,
        message: 'Lấy thông tin kiểm mẫu thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lấy thông tin kiểm mẫu thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi lấy thông tin kiểm mẫu',
      );
    }
  }

  async layDanhSachLoi(): Promise<layDanhSachLoi_ResponseDTO> {
    try {
      const result = await this.technicalDepartmentRepository.layDanhSachLoi();
      return {
        success: true,
        message: 'Lấy danh sách lỗi thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lấy danh sách lỗi thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi lấy danh sách lỗi',
      );
    }
  }

  async TEC_KiemMau_Master_KiemTraTonTai(
    dto: TEC_KiemMau_Master_KiemTraTonTai_RequestDTO,
  ): Promise<TEC_KiemMau_Master_KiemTraTonTai_ResponseDTO> {
    console.log('DTO: ', dto);
    console.log('BarcodeMau:', dto?.BarcodeMau);
    console.log('Type:', typeof dto?.BarcodeMau);
    try {
      if (typeof dto.BarcodeMau !== 'string' || !dto.BarcodeMau.trim())
        throw new BadRequestException('BarcodeMau không hợp lệ');
      if (typeof dto.LoaiKiem !== 'string' || !dto.LoaiKiem.trim())
        throw new BadRequestException('Loại kiểm không hợp lệ');
      if (typeof dto.NguoiKiemMau !== 'string' || !dto.NguoiKiemMau.trim())
        throw new BadRequestException('Người kiểm mẫu không hợp lệ');
      if (!Number.isSafeInteger(Number(dto.TKId)) || Number(dto.TKId) <= 0)
        throw new BadRequestException('TKId không hợp lệ');
      const result =
        await this.technicalDepartmentRepository.TEC_KiemMau_Master_KiemTraTonTai(
          dto.BarcodeMau,
          dto.LoaiKiem,
          dto.NguoiKiemMau,
          dto.TKId,
        );
      return {
        success: true,
        message: 'Kiểm tra và khởi tạo phiếu kiểm mẫu thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Kiểm tra và khởi tạo phiếu kiểm mẫu thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống: Kiểm tra và khởi tạo phiếu kiểm mẫu thất bại',
      );
    }
  }

  async TEC_KiemMau_Detail_Insert(
    dto: TEC_KiemMau_Detail_Insert_RequestDTO,
    file?: Express.Multer.File,
  ): Promise<TEC_KiemMau_Detail_Insert_ResponseDTO> {
    let Image: string | null = null;

    try {
      dto.IdKiemMauMaster = Number(dto.IdKiemMauMaster);
      dto.CumLoiId = Number(dto.CumLoiId);
      dto.SL = Number(dto.SL);
      if (
        !Number.isSafeInteger(dto.IdKiemMauMaster) ||
        Number(dto.IdKiemMauMaster) <= 0
      )
        throw new BadRequestException('IdKiemMauMaster không hợp lệ');
      if (typeof dto.BarcodeMau !== 'string' || !dto.BarcodeMau.trim())
        throw new BadRequestException('BarcodeMau không hợp lệ');
      if (typeof dto.ViTriLoi !== 'string' || !dto.ViTriLoi.trim())
        throw new BadRequestException('ViTriLoi không hợp lệ');
      if (typeof dto.NguoiKhaiBao !== 'string' || !dto.NguoiKhaiBao.trim())
        throw new BadRequestException('NguoiKhaiBao không hợp lệ');
      if (
        typeof dto.MucDoNghiemTrong !== 'string' ||
        !dto.MucDoNghiemTrong.trim()
      )
        throw new BadRequestException('MucDoNghiemTrong không hợp lệ');
      if (typeof dto.MaLoi !== 'string' || !dto.MaLoi.trim())
        throw new BadRequestException('MaLoi không hợp lệ');
      if (typeof dto.TenLoi !== 'string' || !dto.TenLoi.trim())
        throw new BadRequestException('TenLoi không hợp lệ');
      if (!Number.isSafeInteger(dto.CumLoiId) || Number(dto.CumLoiId) <= 0)
        throw new BadRequestException('CumLoiId không hợp lệ');
      if (!Number.isSafeInteger(dto.SL) || Number(dto.SL) <= 0)
        throw new BadRequestException('SL không hợp lệ');
      if (typeof dto.BienPhapXuLy !== 'string' || !dto.BienPhapXuLy.trim())
        throw new BadRequestException('BienPhapXuLy không hợp lệ');
      if (typeof dto.GhiChu !== 'string' || !dto.GhiChu.trim())
        throw new BadRequestException('GhiChu không hợp lệ');
      if (typeof dto.LoaiKiem !== 'string' || !dto.LoaiKiem.trim())
        throw new BadRequestException('LoaiKiem không hợp lệ');

      if (file) {
        Image = await saveImage(file);
      }

      const result =
        await this.technicalDepartmentRepository.TEC_KiemMau_Detail_Insert(
          dto.IdKiemMauMaster,
          dto.BarcodeMau,
          dto.ViTriLoi,
          dto.NguoiKhaiBao,
          dto.MucDoNghiemTrong,
          dto.MaLoi,
          dto.TenLoi,
          dto.CumLoiId,
          dto.SL,
          dto.BienPhapXuLy,
          dto.GhiChu,
          dto.LoaiKiem,
          Image,
        );
      return {
        success: true,
        message: 'Thêm chi tiết lỗi kiểm mẫu thành công',
        data: result,
      };
    } catch (error) {
      // Dọn dẹp ảnh nếu quá trình lưu thất bại
      if (Image) {
        try {
          await deleteImageIfSafe(Image);
        } catch (deleteError) {
          this.logger.error(
            'Không thể xóa ảnh kiểm mẫu',
            deleteError instanceof Error
              ? deleteError.stack
              : String(deleteError),
          );
        }
      }
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Thêm chi tiết lỗi kiểm mẫu thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi thêm chi tiết lỗi kiểm mẫu',
      );
    }
  }

  async TEC_KiemMau_Detail_Select(
    dto: TEC_KiemMau_Detail_Select_RequestDTO,
  ): Promise<TEC_KiemMau_Detail_Select_ResponseDTO> {
    try {
      if (typeof dto.BarcodeMau !== 'string' || !dto.BarcodeMau.trim())
        throw new BadRequestException('BarcodeMau không hợp lệ');
      const result =
        await this.technicalDepartmentRepository.TEC_KiemMau_Detail_Select(
          dto.BarcodeMau,
        );
      return {
        success: true,
        message: 'Lấy danh sách lỗi thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lấy danh sách lỗi thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi lấy danh sách lỗi',
      );
    }
  }

  async TEC_KiemMau_Detail_Delete(
    dto: TEC_KiemMau_Detail_Delete_RequestDTO,
  ): Promise<TEC_KiemMau_Detail_Delete_ResponseDTO> {
    try {
      const idDetail = Number(dto.IdDetail);
      if (!Number.isSafeInteger(idDetail) || idDetail <= 0) {
        throw new BadRequestException('IdDetail không hợp lệ');
      }

      const rowsAffected =
        await this.technicalDepartmentRepository.TEC_KiemMau_Detail_Delete(
          idDetail,
        );

      if (rowsAffected === 0) {
        throw new BadRequestException(
          'Không tìm thấy chi tiết kiểm mẫu cần xóa',
        );
      }

      return {
        success: true,
        message: 'Xóa chi tiết kiểm mẫu thành công',
        rowsAffected,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Xóa chi tiết kiểm mẫu thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi xóa chi tiết kiểm mẫu',
      );
    }
  }

  async TEC_KiemMau_Detail_Update(
    dto: TEC_KiemMau_Detail_Update_RequestDTO,
    file?: Express.Multer.File,
  ): Promise<TEC_KiemMau_Detail_Update_ResponseDTO> {
    let uploadedImagePath: string | null = null;
    let oldImagePath: string | null | undefined;

    try {
      dto.IdDetail = Number(dto.IdDetail);
      dto.IdKiemMauMaster = Number(dto.IdKiemMauMaster);
      dto.CumLoiId = Number(dto.CumLoiId);
      dto.SL = Number(dto.SL);
      const removeImage = parseFormBoolean(dto.RemoveImage);

      if (!Number.isSafeInteger(dto.IdDetail) || Number(dto.IdDetail) <= 0)
        throw new BadRequestException('IdDetail không hợp lệ');
      if (
        !Number.isSafeInteger(dto.IdKiemMauMaster) ||
        Number(dto.IdKiemMauMaster) <= 0
      )
        throw new BadRequestException('IdKiemMauMaster không hợp lệ');
      if (typeof dto.BarcodeMau !== 'string' || !dto.BarcodeMau.trim())
        throw new BadRequestException('BarcodeMau không hợp lệ');
      if (typeof dto.ViTriLoi !== 'string' || !dto.ViTriLoi.trim())
        throw new BadRequestException('ViTriLoi không hợp lệ');
      if (typeof dto.NguoiKhaiBao !== 'string' || !dto.NguoiKhaiBao.trim())
        throw new BadRequestException('NguoiKhaiBao không hợp lệ');
      if (
        typeof dto.MucDoNghiemTrong !== 'string' ||
        !dto.MucDoNghiemTrong.trim()
      )
        throw new BadRequestException('MucDoNghiemTrong không hợp lệ');
      if (typeof dto.MaLoi !== 'string' || !dto.MaLoi.trim())
        throw new BadRequestException('MaLoi không hợp lệ');
      if (typeof dto.TenLoi !== 'string' || !dto.TenLoi.trim())
        throw new BadRequestException('TenLoi không hợp lệ');
      if (!Number.isSafeInteger(dto.CumLoiId) || Number(dto.CumLoiId) <= 0)
        throw new BadRequestException('CumLoiId không hợp lệ');
      if (!Number.isSafeInteger(dto.SL) || Number(dto.SL) <= 0)
        throw new BadRequestException('SL không hợp lệ');
      if (typeof dto.BienPhapXuLy !== 'string' || !dto.BienPhapXuLy.trim())
        throw new BadRequestException('BienPhapXuLy không hợp lệ');
      if (typeof dto.GhiChu !== 'string' || !dto.GhiChu.trim())
        throw new BadRequestException('GhiChu không hợp lệ');
      if (typeof dto.LoaiKiem !== 'string' || !dto.LoaiKiem.trim())
        throw new BadRequestException('LoaiKiem không hợp lệ');
      oldImagePath =
        await this.technicalDepartmentRepository.TEC_KiemMau_Detail_LayImagePath(
          dto.IdDetail,
        );
      if (oldImagePath === undefined) {
        throw new BadRequestException(
          'Không tìm thấy chi tiết kiểm mẫu cần cập nhật',
        );
      }
      if (file) {
        uploadedImagePath = await saveImage(file);
      }

      const result =
        await this.technicalDepartmentRepository.TEC_KiemMau_Detail_Update(
          dto.IdDetail,
          dto.IdKiemMauMaster,
          dto.BarcodeMau,
          dto.ViTriLoi,
          dto.NguoiKhaiBao,
          dto.MucDoNghiemTrong,
          dto.MaLoi,
          dto.TenLoi,
          dto.CumLoiId,
          dto.SL,
          dto.BienPhapXuLy,
          dto.GhiChu,
          dto.LoaiKiem,
          uploadedImagePath,
          removeImage,
        );

      if (
        !Number.isSafeInteger(Number(result?.UpdatedId)) ||
        result.UpdatedId <= 0
      ) {
        throw new InternalServerErrorException(
          'Cập nhật ảnh lỗi kiểm mẫu không thành công',
        );
      }

      if (oldImagePath && (uploadedImagePath || removeImage)) {
        await this.deleteOldImageWhenUnused(oldImagePath);
      }
      return {
        success: true,
        message: 'Cập nhật lỗi kiểm mẫu thành công',
        data: result,
      };
    } catch (error) {
      if (uploadedImagePath) {
        try {
          await deleteImageIfSafe(uploadedImagePath);
        } catch (deleteError) {
          this.logger.error(
            'Không thể xóa ảnh kiểm mẫu mới tải lên',
            deleteError instanceof Error
              ? deleteError.stack
              : String(deleteError),
          );
        }
      }
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Cập nhật lỗi kiểm mẫu thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi cập nhật lỗi kiểm mẫu',
      );
    }
  }

  private async deleteOldImageWhenUnused(imagePath: string): Promise<void> {
    try {
      const referenceCount =
        await this.technicalDepartmentRepository.TEC_KiemMau_Detail_DemSuDungImagePath(
          imagePath,
        );

      if (referenceCount === 0) {
        await deleteImageIfSafe(imagePath);
      }
    } catch (error) {
      this.logger.warn(
        `Không thể dọn ảnh kiểm mẫu cũ sau cập nhật: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

function parseFormBoolean(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }
  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }

  throw new BadRequestException('RemoveImage không hợp lệ');
}
