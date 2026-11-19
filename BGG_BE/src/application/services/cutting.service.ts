import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ICuttingService } from '../interfaces/cutting.service.interface.js';
import type { ICuttingRepository } from '../../domain/repositories/cutting.repository.interface.js';
import {
  Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_ResponseDTO,
  CUTTING_LAYDANHSACH_BANCAT_THEO_TKID_ResponseDTO,
  getChungLoaiByPHTId_ResponseDTO,
  getDsMauVaiVaMauSanPhamTheoPHTId_ResponseDTO,
  Cutting_PhieuHoachToan_DanhSachPO_ResponseDTO,
  getRongSdVaDaiSdTheoMaPhieu_ResponseDTO,
  getThongTinTraiByPHTId_ResponseDTO,
  getTinhTrangKhoaPhieuByPHTId_ResponseDTO,
  layTongSoLop_ResponseDTO,
  wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_ResponseDTO,
  capNhatHoachToan_ResponseDTO,
  capNhatTraiVai_ResponseDTO,
  khoaPhieu_ResponseDTO,
  kiemTraCayDeNoi_ResponseDTO,
  layThongTinCay_ResponseDTO,
  layDanhSachCayNoiBaoGomCayGoc_ResponseDTO,
  quetNhanCayGoc_ResponseDTO,
  Cutting_HoachToanThuong_QuetNhanCay_ResponseDTO,
  themCayNoi_ResponseDTO,
} from '../dtos/cutting-response.dto.js';
import {
  capNhatHoachToan_RequestDTO,
  capNhatTraiVai_RequestDTO,
  Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_RequestDTO,
  khoaPhieu_RequestDTO,
  kiemTraCayDeNoi_RequestDTO,
  layThongTinCay_RequestDTO,
  layDanhSachCayNoiBaoGomCayGoc_RequestDTO,
  quetNhanCayGoc_RequestDTO,
  Cutting_HoachToanThuong_QuetNhanCay_RequestDTO,
  wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_RequestDTO,
  themCayNoi_RequestDTO,
} from '../dtos/cutting-request.dto.js';

@Injectable()
export class CuttingService implements ICuttingService {
  private logger = new Logger(CuttingService.name);

  constructor(
    @Inject('ICuttingRepository')
    private readonly cuttingRepository: ICuttingRepository,
  ) {}

  async loadDanhSachBanCat(
    TKId: number,
  ): Promise<CUTTING_LAYDANHSACH_BANCAT_THEO_TKID_ResponseDTO> {
    try {
      const result = await this.cuttingRepository.loadDanhSachBanCat(TKId);
      return {
        success: true,
        message: 'Lấy danh sách bàn cắt thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi khi lấy danh sách bàn cắt',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: 'Lấy danh sách bàn cắt thất bại',
        data: null,
      };
    }
  }

  async loadDanhSachPhieuHoachToan(
    dto: Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_RequestDTO,
  ): Promise<Cutting_DanhSachPhieuHoachToan_TheoMaHang_Test_Android_ResponseDTO> {
    try {
      const result = await this.cuttingRepository.loadDanhSachPhieuHoachToan(
        dto.MaHang,
        dto.SoPhieu,
        dto.NgayHoachToan,
        dto.DaHoachToan,
        dto.NhomCat,
        dto.BanCat,
      );

      return {
        success: true,
        message: 'Lấy danh sách phiếu hoạch toán thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy danh sách phiếu hoạch toán',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: 'Lấy danh sách phiếu hoạch toán thất bại',
        data: [],
      };
    }
  }

  async loadDanhSachChiTietPhieuHoachToanTheoPHTId(
    dto: wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_RequestDTO,
  ): Promise<wh_DanhSachChiTietPhieuHoachToan_TheoPhieuHoachToanId_ResponseDTO> {
    try {
      const result =
        await this.cuttingRepository.loadDanhSachChiTietPhieuHoachToanTheoPHTId(
          dto.PhieuHoachToanId,
          dto.MaCay,
        );
      return {
        success: true,
        message: 'Lấy danh sách chi tiết PHT thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy danh sách chi tiết PHT',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: 'Lấy danh sách chi tiết PHT thất bại',
        data: [],
      };
    }
  }

  async getChungLoaiByPHTId(
    PhieuHoachToanId: number,
  ): Promise<getChungLoaiByPHTId_ResponseDTO> {
    try {
      const result =
        await this.cuttingRepository.getChungLoaiByPHTId(PhieuHoachToanId);
      return {
        success: true,
        message: 'Lấy danh sách chủng loại thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy danh sách chủng loại theo PHTId',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: 'Lấy danh sách chủng loại thất bại',
        data: [],
      };
    }
  }

  async getDsMauVaiVaMauSanPhamTheoPHTId(
    PhieuHoachToanId: number,
  ): Promise<getDsMauVaiVaMauSanPhamTheoPHTId_ResponseDTO> {
    try {
      const result =
        await this.cuttingRepository.getDsMauVaiVaMauSanPhamTheoPHTId(
          PhieuHoachToanId,
        );
      return {
        success: true,
        message: 'Lấy danh sách màu thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy danh sách màu theo PHTId',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: 'Lấy danh sách màu thất bại',
        data: [],
      };
    }
  }

  async getDanhSachPOByPHTId(
    PhieuHoachToanId: number,
  ): Promise<Cutting_PhieuHoachToan_DanhSachPO_ResponseDTO> {
    try {
      const result =
        await this.cuttingRepository.getDanhSachPOByPHTId(PhieuHoachToanId);
      return {
        success: true,
        message: 'Lấy danh sách PO theo PHTId thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lấy danh sách PO theo PHTId thất bại',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: 'Lấy danh sách PO thất bại',
        data: [],
      };
    }
  }

  async getRongSdVaDaiSdTheoMaPhieu(
    MaPhieu: number,
  ): Promise<getRongSdVaDaiSdTheoMaPhieu_ResponseDTO> {
    try {
      const result =
        await this.cuttingRepository.getRongSdVaDaiSdTheoMaPhieu(MaPhieu);
      return {
        success: true,
        message: 'lấy thông tin số đo thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi lấy thông tin số đo',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: 'Lấy thông tin số đo thất bại',
        data: [],
      };
    }
  }

  async getThongTinTraiByPHTId(
    PhieuHoachToanId: number,
  ): Promise<getThongTinTraiByPHTId_ResponseDTO> {
    try {
      if (!Number.isSafeInteger(PhieuHoachToanId) || PhieuHoachToanId <= 0) {
        throw new BadRequestException('Phiếu hoạch toán ID ko hợp lệ');
      }

      const result =
        await this.cuttingRepository.getThongTinTraiByPHTId(PhieuHoachToanId);

      return {
        success: true,
        message: 'Lấy thông tin trải thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi lấy thông tin trãi theo PHTId',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Lấy thông tin trải thất bại');
    }
  }

  async getTinhTrangKhoaPhieuByPHTId(
    PhieuHoachToanId: number,
  ): Promise<getTinhTrangKhoaPhieuByPHTId_ResponseDTO> {
    try {
      if (!Number.isSafeInteger(PhieuHoachToanId) || PhieuHoachToanId <= 0) {
        throw new BadRequestException('Phiếu hoạch toán ID không hợp lệ');
      }

      const result =
        await this.cuttingRepository.getTinhTrangKhoaPhieuByPHTId(
          PhieuHoachToanId,
        );

      return {
        success: true,
        message: 'Lấy tình trạng khóa phiếu thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Lỗi lấy tình trạng khóa phiếu theo PHTId',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lấy tình trạng khóa phiếu thất bại',
      );
    }
  }

  async layTongSoLop(
    PhieuHoachToanId: number,
  ): Promise<layTongSoLop_ResponseDTO> {
    try {
      if (!Number.isSafeInteger(PhieuHoachToanId) || PhieuHoachToanId <= 0) {
        throw new BadRequestException('Phiếu hoạch toán ID không hợp lệ');
      }

      const result =
        await this.cuttingRepository.layTongSoLop(PhieuHoachToanId);

      return {
        success: true,
        message: 'Lấy tổng số lớp thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Lỗi lấy tổng số lớp theo PHTId',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Lấy tổng số lớp thất bại');
    }
  }

  async capNhatHoachToan(
    dto: capNhatHoachToan_RequestDTO,
  ): Promise<capNhatHoachToan_ResponseDTO> {
    try {
      if (
        !Number.isSafeInteger(dto.PhieuHoachToanId) ||
        dto.PhieuHoachToanId <= 0
      ) {
        throw new BadRequestException(
          'Phiếu hoạch toán Id phải là số nguyên dương',
        );
      }

      if (
        !Number.isFinite(dto.DaiBanTraiThucTe) ||
        dto.DaiBanTraiThucTe <= 0 ||
        !Number.isFinite(dto.KhoVaiThucTe) ||
        dto.KhoVaiThucTe <= 0 ||
        !Number.isFinite(dto.RongSoDo) ||
        dto.RongSoDo <= 0 ||
        !Number.isFinite(dto.DaiSoDo) ||
        dto.DaiSoDo <= 0
      ) {
        throw new BadRequestException(
          'Các thông số hạch toán phải là số hợp lệ lớn hơn 0',
        );
      }

      await this.cuttingRepository.capNhatHoachToan(
        dto.PhieuHoachToanId,
        dto.DaiBanTraiThucTe,
        dto.KhoVaiThucTe,
        dto.RongSoDo,
        dto.DaiSoDo,
      );

      return {
        success: true,
        message: 'Cập nhật hoạch toán thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        'Lỗi khi cập nhật hoạch toán',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Cập nhật hoạch toán thất bại');
    }
  }

  async capNhatTraiVai(
    dto: capNhatTraiVai_RequestDTO,
  ): Promise<capNhatTraiVai_ResponseDTO> {
    try {
      if (
        !Number.isInteger(dto.PhieuHoachToanId) ||
        Number(dto.PhieuHoachToanId) <= 0
      ) {
        throw new BadRequestException('Phiếu hoạch toán Id không hợp lệ');
      }

      if (typeof dto.TenNguoiTrai !== 'string' || !dto.TenNguoiTrai.trim()) {
        throw new BadRequestException('Tên người đăng nhập không hợp lệ');
      }

      const response = await this.cuttingRepository.capNhatTraiVai(
        dto.PhieuHoachToanId,
        dto.TenNguoiTrai,
      );

      return {
        success: true,
        message: 'Cập nhật trải vải thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Lỗi cập nhật trải vải',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Lỗi hệ thống khi cập nhật trải vải',
      );
    }
  }

  async khoaPhieu(dto: khoaPhieu_RequestDTO): Promise<khoaPhieu_ResponseDTO> {
    try {
      if (
        !Number.isSafeInteger(dto.PhieuHoachToanId) ||
        dto.PhieuHoachToanId <= 0
      ) {
        throw new BadRequestException('Phiếu hoạch toán Id không hợp lệ');
      }

      if (typeof dto.DaHoachToan !== 'boolean') {
        throw new BadRequestException('Trạng thái hoạch toán không hợp lệ');
      }

      if (
        dto.TKId != null &&
        (!Number.isSafeInteger(dto.TKId) || dto.TKId <= 0)
      ) {
        throw new BadRequestException('Tài khoản ID không hợp lệ');
      }

      if (
        dto.NguoiKhoaPhieu != null &&
        (typeof dto.NguoiKhoaPhieu !== 'string' ||
          !dto.NguoiKhoaPhieu.trim() ||
          dto.NguoiKhoaPhieu.length > 250)
      ) {
        throw new BadRequestException('Người khóa phiếu không hợp lệ');
      }

      const result = await this.cuttingRepository.khoaPhieu(
        dto.PhieuHoachToanId,
        dto.DaHoachToan,
        dto.TKId,
        dto.NguoiKhoaPhieu,
      );

      if (!result) {
        throw new InternalServerErrorException(
          'Không nhận được kết quả khóa phiếu',
        );
      }

      if (result.KetQua !== 0) {
        throw new InternalServerErrorException(
          result.ThongBao || 'Khóa phiếu thất bại',
        );
      }

      return {
        success: true,
        message: result.ThongBao || 'Khóa phiếu thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Lỗi khóa phiếu hoạch toán',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Lỗi hệ thống khi khóa phiếu hoạch toán',
      );
    }
  }

  async kiemTraCayDeNoi(
    dto: kiemTraCayDeNoi_RequestDTO,
  ): Promise<kiemTraCayDeNoi_ResponseDTO> {
    try {
      if (
        !Number.isSafeInteger(dto.PhieuHoachToanId) ||
        dto.PhieuHoachToanId <= 0
      ) {
        throw new BadRequestException('Phiếu hoạch toán ID không hợp lệ');
      }

      // if (
      //   !Number.isSafeInteger(dto.ChiTietPhieuHoachToanId) ||
      //   dto.ChiTietPhieuHoachToanId <= 0
      // ) {
      //   throw new BadRequestException(
      //     'Chi tiết phiếu hoạch toán ID không hợp lệ',
      //   );
      // }

      if (typeof dto.MaCay !== 'string' || !dto.MaCay.trim()) {
        throw new BadRequestException('Mã cây không hợp lệ');
      }
      const response = await this.cuttingRepository.kiemTraCayDeNoi(
        dto.PhieuHoachToanId,
        dto.ChiTietPhieuHoachToanId,
        dto.MaCay,
      );

      return {
        success: response.HopLe === true,
        message: response.ThongBao,
        data: response,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Lỗi khi kiểm tra cây để nối',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Hệ thống lỗi khi kiểm tra cây để nối ',
      );
    }
  }

  async layThongTinCay(
    dto: layThongTinCay_RequestDTO,
  ): Promise<layThongTinCay_ResponseDTO> {
    try {
      if (
        !Number.isSafeInteger(dto.PhieuHoachToanId) ||
        Number(dto.PhieuHoachToanId) <= 0
      ) {
        throw new BadRequestException('Phiếu hoạch toán ID không hợp lệ');
      }
      if (typeof dto.MaCay !== 'string' || !dto.MaCay.trim()) {
        throw new BadRequestException('Mã cây không hợp lệ');
      }
      const response = await this.cuttingRepository.layThongTinCayGoc(
        dto.MaCay,
        dto.PhieuHoachToanId,
      );

      return {
        success: true,
        message: 'Lấy thông tin cây thành công',
        data: response,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Lỗi lấy thông tin cây gốc',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi lấy thông tin cây',
      );
    }
  }

  async layDanhSachCayNoiBaoGomCayGoc(
    dto: layDanhSachCayNoiBaoGomCayGoc_RequestDTO,
  ): Promise<layDanhSachCayNoiBaoGomCayGoc_ResponseDTO> {
    try {
      if (
        !Number.isSafeInteger(dto.ChiTietPhieuHoachToanId) ||
        dto.ChiTietPhieuHoachToanId <= 0
      ) {
        throw new BadRequestException(
          'Chi tiết phiếu hoạch toán ID không hợp lệ',
        );
      }

      const result = await this.cuttingRepository.layDanhSachCayNoiBaoGomCayGoc(
        dto.ChiTietPhieuHoachToanId,
      );

      return {
        success: true,
        message: 'Lấy danh sách cây nối bao gồm cây gốc thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Lỗi lấy danh sách cây nối bao gồm cây gốc',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Lấy danh sách cây nối bao gồm cây gốc thất bại',
      );
    }
  }

  async quetNhanCayGoc(
    dto: quetNhanCayGoc_RequestDTO,
  ): Promise<quetNhanCayGoc_ResponseDTO> {
    try {
      if (
        !Number.isSafeInteger(dto.PhieuHoachToanId) ||
        dto.PhieuHoachToanId <= 0
      ) {
        throw new BadRequestException('Phiếu hoạch toán ID không hợp lệ');
      }

      if (typeof dto.MaCay !== 'string' || !dto.MaCay.trim()) {
        throw new BadRequestException('Mã cây không hợp lệ');
      }

      if (dto.MaCay.trim().length > 200) {
        throw new BadRequestException('Mã cây vượt quá 200 ký tự');
      }

      const nonNegativeFields = [
        dto.Yard,
        dto.ThucTe,
        dto.Thua,
        dto.Thieu,
        dto.SoMetTrai,
        dto.TieuHaoThucTe,
        dto.NguyenCay,
        dto.ThuHoi1,
        dto.ThuHoi2,
        dto.ThuHoi3,
        dto.ThuHoi4,
        dto.ThuHoi5,
      ];

      if (
        !Number.isFinite(dto.Met) ||
        dto.Met <= 0 ||
        nonNegativeFields.some((value) => !Number.isFinite(value) || value < 0)
      ) {
        throw new BadRequestException('Số liệu mét/yard không hợp lệ');
      }

      if (!Number.isInteger(dto.SoBTP) || dto.SoBTP < 0) {
        throw new BadRequestException('Số BTP không hợp lệ');
      }

      const thuHoi = [
        dto.ThuHoi1,
        dto.ThuHoi2,
        dto.ThuHoi3,
        dto.ThuHoi4,
        dto.ThuHoi5,
      ];

      if (thuHoi.some((value) => value > 50)) {
        throw new BadRequestException('Mỗi số mét thu hồi không được vượt 50');
      }

      if (dto.NguyenCay > 0 && dto.Thieu > 0) {
        throw new BadRequestException(
          'Không thể đồng thời ghi nhận nguyên cây và thiếu vải',
        );
      }

      if (Math.abs(dto.SoMetTrai - dto.TieuHaoThucTe) > 0.01) {
        throw new BadRequestException('Số mét trải phải bằng tiêu hao thực tế');
      }

      const result = await this.cuttingRepository.quetNhanCayGoc({
        PhieuHoachToanId: dto.PhieuHoachToanId,
        MaCay: dto.MaCay.trim(),
        MauLot: dto.MauLot,
        MauVai: dto.MauVai,
        PO: dto.PO,
        MauSP: dto.MauSP,
        ChungLoai: dto.ChungLoai,
        Yard: dto.Yard,
        Met: dto.Met,
        ThucTe: dto.ThucTe,
        Thua: dto.Thua,
        Thieu: dto.Thieu,
        SoMetTrai: dto.SoMetTrai,
        TieuHaoThucTe: dto.TieuHaoThucTe,
        NguyenCay: dto.NguyenCay,
        SoBTP: dto.SoBTP,
        ThuHoi1: dto.ThuHoi1,
        ThuHoi2: dto.ThuHoi2,
        ThuHoi3: dto.ThuHoi3,
        ThuHoi4: dto.ThuHoi4,
        ThuHoi5: dto.ThuHoi5,
      });

      if (!result) {
        throw new InternalServerErrorException(
          'Không nhận được kết quả tạo cây gốc',
        );
      }

      return {
        success: result.ThanhCong === true,
        message: result.ThongBao,
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Lỗi tạo cây gốc nối',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('Tạo cây gốc nối thất bại');
    }
  }

  async quetNhanCayHoachToanThuong(
    dto: Cutting_HoachToanThuong_QuetNhanCay_RequestDTO,
  ): Promise<Cutting_HoachToanThuong_QuetNhanCay_ResponseDTO> {
    try {
      const result =
        await this.cuttingRepository.quetNhanCayHoachToanThuong(dto);

      if (!result) {
        throw new InternalServerErrorException(
          'Stored procedure không trả về dữ liệu',
        );
      }

      return {
        success: result.ThanhCong === true,
        message: result.ThongBao,
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Lỗi quét nhận cây hoạch toán thường',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Quét nhận cây hoạch toán thường thất bại',
      );
    }
  }

  async themCayNoi(
    dto: themCayNoi_RequestDTO,
  ): Promise<themCayNoi_ResponseDTO> {
    try {
      if (
        !Number.isSafeInteger(dto.ChiTietPhieuHoachToanId) ||
        dto.ChiTietPhieuHoachToanId <= 0
      )
        throw new BadRequestException('ChiTietPhieuHoachToanId không hợp lệ');
      if (
        !Number.isSafeInteger(dto.PhieuHoachToanId) ||
        dto.PhieuHoachToanId <= 0
      )
        throw new BadRequestException('PhieuHoachToanId không hợp lệ');
      if (typeof dto.MaCay !== 'string' || !dto.MaCay.trim())
        throw new BadRequestException('MaCay không hợp lệ');

      const nonNegativeFields = [
        dto.Yard,
        dto.ThucTe,
        dto.Thua,
        dto.Thieu,
        dto.SoMetTrai,
        dto.TieuHaoThucTe,
        dto.NguyenCay,
        dto.ThuHoi1,
        dto.ThuHoi2,
        dto.ThuHoi3,
        dto.ThuHoi4,
        dto.ThuHoi5,
      ];
      if (
        !Number.isFinite(dto.Met) ||
        dto.Met <= 0 ||
        nonNegativeFields.some((value) => !Number.isFinite(value) || value < 0)
      )
        throw new BadRequestException('Số liệu mét/yard không hợp lệ');
      if (!Number.isInteger(dto.SoBTP) || dto.SoBTP < 0) {
        throw new BadRequestException('Số BTP không hợp lệ');
      }
      if (dto.NguyenCay > 0 && dto.Thieu > 0) {
        throw new BadRequestException(
          'Không thể đồng thời ghi nhận nguyên cây và thiếu vải',
        );
      }
      if (Math.abs(dto.SoMetTrai - dto.TieuHaoThucTe) > 0.01) {
        throw new BadRequestException('Số mét trải phải bằng tiêu hao thực tế');
      }
      const result = await this.cuttingRepository.themCayNoi(
        dto.ChiTietPhieuHoachToanId,
        dto.PhieuHoachToanId,
        dto.MaCay,
        dto.MauLot,
        dto.MauVai,
        dto.PO,
        dto.Yard,
        dto.Met,
        dto.SoMetTrai,
        dto.TieuHaoThucTe,
        dto.ThucTe,
        dto.Thua,
        dto.Thieu,
        dto.NguyenCay,
        dto.ThuHoi1,
        dto.ThuHoi2,
        dto.ThuHoi3,
        dto.ThuHoi4,
        dto.ThuHoi5,
        dto.SoBTP,
        dto.Cay,
      );

      if (!result) {
        throw new InternalServerErrorException(
          'Không nhận được kết quả tạo cây gốc',
        );
      }
      return {
        success: result.ThanhCong === true,
        message: result.ThongBao,
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi tạo cây nối',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Tạo cây nối thất bại');
    }
  }
}
