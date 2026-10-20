import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IPickingOrderService } from '../interfaces/picking-order-service.interface.js';
import { wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android } from '../../domain/entities/picking-order.entity.js';
import {
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_RequestDTO,
  wh_DanhSachPhieuSoanHangNgayVaTinhTrang_RequestDTO,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_RequestDTO,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_RequestDTO,
} from '../dtos/picking-order-request.dto.js';
import {
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_ResponseDTO,
  wh_DanhSachPhieuSoanHang_TuNgayDenNgay_ResponseDTO,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_ResponseDTO,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_ResponseDTO,
} from '../dtos/picking-order-response.dto.js';
import type { IPickingOrderRepository } from '../../domain/repositories/picking-order.repository.interface.js';
import { NotFoundError } from 'rxjs';

@Injectable()
export class PickingOrderService implements IPickingOrderService {
  private readonly logger = new Logger(PickingOrderService.name);

  constructor(
    @Inject('IPickingOrderRepository')
    public readonly pickingOrderRepository: IPickingOrderRepository,
  ) {}

  async getDanhSachPhieuSoanHangTheoNgayVaTinhTrang(
    dto: wh_DanhSachPhieuSoanHangNgayVaTinhTrang_RequestDTO,
  ): Promise<wh_DanhSachPhieuSoanHang_TuNgayDenNgay_ResponseDTO> {
    try {
      const result =
        await this.pickingOrderRepository.getDanhSachPhieuSoanHangTheoNgayVaTinhTrang(
          dto.maKho,
          dto.tkId,
          dto.ngaySoan,
          dto.tinhTrang,
        );

      if (!result || result.length === 0)
        throw new NotFoundException('Không tìm thấy danh sách phiếu soạn hàng');

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy danh sách phiếu soạn hàng',
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Lấy danh sách phiếu soạn hàng thất bại',
      );
    }
  }

  async getDanhSachChiTietPhieuSoanHangTheoPhieuSoanHangId(
    dto: wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_RequestDTO,
  ): Promise<wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_ResponseDTO> {
    try {
      const result =
        await this.pickingOrderRepository.getDanhSachChiTietPhieuSoanHangTheoPhieuSoanHangId(
          dto.PhieuSoanHangId,
        );

      if (!result || result.length === 0) {
        throw new NotFoundException('Không tìm thấy danh sách ctpsh');
      }

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy danh sách ctpsh',
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Lấy danh sách chi tiết phiếu soạn hàng thất bại',
      );
    }
  }

  async getDanhSachVatTuTheoMaRoVaPhieuSoanHang(
    dto: wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_RequestDTO,
  ): Promise<wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_ResponseDTO> {
    try {
      const result =
        await this.pickingOrderRepository.getDanhSachVatTuTheoMaRoVaPhieuSoanHang(
          dto.PhieuSoanHangId,
          dto.SoRo,
        );

      if (!result || result.length === 0)
        throw new NotFoundException('Không tìm thấy Danh sách vật tư');

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi lấy danh sách vật tư',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('Lấy danh sách vật tư thất bại');
    }
  }

  // Xác nhận soạn hàng
  async wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android(
    dto: wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_RequestDTO,
  ): Promise<wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_ResponseDTO> {
    let data: wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android[];

    // 1. Log dữ liệu nhận từ Frontend
    this.logger.log(`Dữ liệu xác nhận soạn hàng: ${JSON.stringify(dto)}`);

    // 2. Gọi Stored Procedure
    try {
      data =
        await this.pickingOrderRepository.wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android(
          dto.PhieuSoanHangId,
          dto.MaCay,
          dto.SoLuongThucSoan,
          dto.TKQuet,
          dto.TenNguoiQuyetXuat,
        );

      // Kiểm tra kết quả Procedure
      this.logger.log(`Kết quả PROC: ${JSON.stringify(data)}`);
    } catch (error) {
      this.logger.error(
        'Lỗi gọi PROC soạn hàng',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('Không thể thực hiện soạn hàng');
    }

    // 3. Kiểm tra dữ liệu trả về
    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('PROC không trả về dữ liệu');

      throw new UnprocessableEntityException('Không có dữ liệu trả về');
    }

    // 4. Kiểm tra kết quả nghiệp vụ
    const failed = data.find((item) => Number(item.KetQua) !== 1);

    if (failed) {
      const errorMessage =
        failed.Loi || `Soạn hàng thất bại. Mã kết quả: ${failed.KetQua}`;

      this.logger.warn(`PROC trả về lỗi: ${JSON.stringify(failed)}`);

      throw new UnprocessableEntityException(errorMessage);
    }

    // 5. Thành công
    this.logger.log(`Soạn hàng thành công - Mã cây: ${dto.MaCay}`);

    return {
      success: true,
      message: 'Soạn hàng thành công',
      data,
    };
  }
}
