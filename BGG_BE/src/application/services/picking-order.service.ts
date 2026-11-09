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
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang_RequestDTO,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_RequestDTO,
  wh_KiemTraTienDoSoanHang_RequestDTO,
  wh_XacNhanXuatKho_RequestDTO,
} from '../dtos/picking-order-request.dto.js';
import {
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId_ResponseDTO,
  wh_DanhSachPhieuSoanHang_TuNgayDenNgay_ResponseDTO,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang_ResponseDTO,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang_ResponseDTO,
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android_ResponseDTO,
  wh_KiemTraTienDoSoanHang_ResponseDTO,
  wh_XacNhanXuatKho_ResponseDTO,
} from '../dtos/picking-order-response.dto.js';
import type { IPickingOrderRepository } from '../../domain/repositories/picking-order.repository.interface.js';

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

  async getDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang(
    dto: wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang_RequestDTO,
  ): Promise<wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang_ResponseDTO> {
    try {
      const result =
        await this.pickingOrderRepository.getDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang(
          dto.PhieuSoanHangId,
          dto.SoRo,
          dto.MaCay,
        );

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi lấy danh sách vật tư theo QR trang',
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

  // Kiểm tra tiến độ soạn hàng
  async kiemTraTienDoSoanHang(
    dto: wh_KiemTraTienDoSoanHang_RequestDTO,
  ): Promise<wh_KiemTraTienDoSoanHang_ResponseDTO> {
    try {
      const data = await this.pickingOrderRepository.getTienDoSoanHang(
        dto.PhieuSoanHangId,
      );

      return {
        success: true,
        message: 'Lấy tiến độ soạn hàng thành công',
        data,
      };
    } catch (error) {
      this.logger.error(
        `Lỗi kiểm tra tiến độ phiếu ${dto.PhieuSoanHangId}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Kiểm tra tiến độ soạn hàng thất bại',
      );
    }
  }

  // Xác nhận xuất kho
  async xacNhanXuatKho(
    dto: wh_XacNhanXuatKho_RequestDTO,
  ): Promise<wh_XacNhanXuatKho_ResponseDTO> {
    try {
      this.logger.log(
        `Yêu cầu xác nhận xuất kho: Phieu=${dto.PhieuSoanHangId}, HoanTat=${dto.xacNhanHoanTat}, ChoPhepThieu=${dto.choPhepDongKhiThieu}, Nguoi=${dto.tenNguoiXacNhan}`,
      );

      const data = await this.pickingOrderRepository.xacNhanXuatKho(dto);

      return {
        success: true,
        message: data.isHoanThanh
          ? 'Đã xác nhận hoàn tất xuất kho thành công'
          : `Đã xác nhận xuất kho Đợt ${data.soDot} thành công (xuất thiếu)`,
        data,
      };
    } catch (error) {
      this.logger.error(
        `Lỗi xác nhận xuất kho phiếu ${dto.PhieuSoanHangId}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Xác nhận xuất kho thất bại',
      );
    }
  }
}
