import {
  QM_PhieuKiemVai_TheoTKId_RequestDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_RequestDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_RequestDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_RequestDTO,
  QM_DoKhoVai_ThemMoi_RequestDTO,
  QM_PhieuKiemVai_CayVai_CapNhatGhiChu_RequestDTO,
  QM_PhieuKiemVai_CayVai_Delete_RequestDTO,
  QM_PhieuKiemVai_CayVai_XongCay_Android_RequestDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_RequestDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_RequestDTO,
  layMaMau_RequestDTO,
} from '../dtos/fabric-inspection-request.dto.js';
import {
  QM_PhieuKiemVai_TheoTKId_ResponseDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_ResponseDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_ResponseDTO,
  QM_DoKhoVai_ThemMoi_ResponseDTO,
  QM_DoKhoVai_ResponseDTO,
  QM_PhieuKiemVai_CayVai_CapNhatGhiChu_ResponseDTO,
  QM_PhieuKiemVai_CayVai_Delete_ResponseDTO,
  QM_PhieuKiemVai_CayVai_XongCay_Android_ResponseDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_ResponseDTO,
  QM_PhieuKiemVai_TaoPhieuKiem_ResponseDTO,
  QM_PhieuKiemVai_LayDanhSachMaHang_Web_ResponseDTO,
  layDanhSachChungLoaiCoItem_ResponseDTO,
  layDanhSachChungLoaiKoItem_ResponseDTO,
  layDanhSachItem_ResponseDTO,
  layMaMau_ResponseDTO,
  layArt_ResponseDTO,
} from '../dtos/fabric-inspection-response.dto.js';
import { IFabricInspectionService } from '../interfaces/fabric-inspection.service.interface.js';
import type { IFabricInspectionRepository } from '../../domain/repositories/fbabric-inspection.repository.interface.js';
import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class FabricInspectionService implements IFabricInspectionService {
  private readonly logger = new Logger(FabricInspectionService.name);

  constructor(
    @Inject('IFabricInspectionRepository')
    private readonly fabricInspectionRepository: IFabricInspectionRepository,
  ) {}

  async loadPhieuTheoTKId(
    dto: QM_PhieuKiemVai_TheoTKId_RequestDTO,
  ): Promise<QM_PhieuKiemVai_TheoTKId_ResponseDTO> {
    try {
      const result = await this.fabricInspectionRepository.loadPhieuTheoTKId(
        dto.TKId,
        dto.MaHang,
      );
      if (!result || result.length === 0)
        throw new NotFoundException('Không tìm thấy danh sách Phiếu kiểm vải');
      return {
        success: true,
        message: 'Lấy danh sách phiểu kiểm vải thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi lấy danh sách phiếu kiểm vải',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Lấy danh sách thất bại');
    }
  }

  async loadCayVaiTheoPhieuKiem(
    dto: QM_PhieuKiemVai_CayVai_TheoPKVId_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_TheoPKVId_ResponseDTO> {
    try {
      const result =
        await this.fabricInspectionRepository.loadCayVaiTheoPhieuKiem(
          dto.PKVId,
          dto.MaCay,
        );
      if (!result || result.length === 0)
        throw new NotFoundException('Không tìm thấy danh sách cây vải');

      return {
        success: true,
        message: 'Lấy danh sách cây vải thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi lấy danh sách cây vải',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Có lỗi khi lấy danh sách cây');
    }
  }

  async loadDanhSachLoi(
    dto: QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_RequestDTO,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO> {
    try {
      const result = await this.fabricInspectionRepository.loadDanhSachLoi(
        dto.ViTri,
      );
      if (!result || result.length === 0)
        throw new NotFoundException('Không tìm thấy danh sách lỗi');

      return {
        success: true,
        message: 'Lấy danh sách lỗi thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi lấy danh sách lỗi',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Có lỗi khi lấy danh sách lỗi');
    }
  }

  async layChiTietCayVai(
    CTId: number,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO> {
    try {
      if (!CTId) throw new NotFoundException('CTId not found');

      const result =
        await this.fabricInspectionRepository.layChiTietCayVai(CTId);

      return {
        success: true,
        message: 'Fabric roll defect details retrieved successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Error retrieving fabric roll defect details',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Unable to retrieve fabric roll defect details',
      );
    }
  }

  async themLoiCayVai(
    dto: QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_RequestDTO,
  ): Promise<QM_PhieuKiemVai_Cay_ChiTiet_ThemMoi_ResponseDTO> {
    try {
      await this.fabricInspectionRepository.themLoiCayVai(
        dto.CTId,
        dto.MaLoi,
        dto.TenLoi,
        dto.ViTriKiem,
        dto.SoDiem,
        dto.TuViTri,
        dto.DenViTri,
        dto.SoLoi,
        dto.TongDiem,
        dto.SoDiemTrungBinh,
        dto.SoYard,
      );

      return {
        success: true,
        message: 'Thêm lỗi thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi khi thêm lỗi cây vải',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Có lỗi khi thêm lỗi cây vải');
    }
  }

  async doKho(
    dto: QM_DoKhoVai_ThemMoi_RequestDTO,
  ): Promise<QM_DoKhoVai_ThemMoi_ResponseDTO> {
    try {
      await this.fabricInspectionRepository.doKho(
        dto.CTId,
        dto.ViTri,
        dto.KhoCM,
        dto.KhoIN,
      );

      return {
        success: true,
        message: 'Đo khổ thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi khi đo khổ',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Có lỗi khi đo khổ');
    }
  }

  async layKetQuaDo(CTId: number): Promise<QM_DoKhoVai_ResponseDTO> {
    try {
      if (!CTId) throw new NotFoundException('Không tìm thấy CTId');
      const result = await this.fabricInspectionRepository.layKetQuaDo(CTId);
      return {
        success: true,
        message: 'Lấy kết quả đo khổ thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Lỗi lấy kết quả đo khổ',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Có lỗi khi lấy kết quả đo khổ');
    }
  }

  async capNhatGhiChuHuongXuLyCayVai(
    dto: QM_PhieuKiemVai_CayVai_CapNhatGhiChu_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_CapNhatGhiChu_ResponseDTO> {
    try {
      await this.fabricInspectionRepository.capNhatGhiChuHuongXuLyCayVai(
        dto.CTId,
        dto.GhiChu,
        dto.HuongXuLy,
      );
      return {
        success: true,
        message: 'Cập nhật thành công',
      };
    } catch (error) {
      this.logger.error(
        'Lỗi cập nhật cây vải',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Có lỗi khi cập nhật cây vải');
    }
  }

  async xoaCayVai(
    dto: QM_PhieuKiemVai_CayVai_Delete_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_Delete_ResponseDTO> {
    try {
      await this.fabricInspectionRepository.xoaCayVai(
        dto.CTId,
        dto.CayId,
        dto.MaCayVai,
      );

      return {
        success: true,
        message: `Xóa thành công cây ${dto.MaCayVai}`,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi khi xóa cây vải',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Có lỗi khi xóa cây vải');
    }
  }

  async xongCayVai(
    dto: QM_PhieuKiemVai_CayVai_XongCay_Android_RequestDTO,
  ): Promise<QM_PhieuKiemVai_CayVai_XongCay_Android_ResponseDTO> {
    try {
      await this.fabricInspectionRepository.xongCayVai(
        dto.CTId,
        dto.GhiChu,
        dto.KetQuaKiem,
        dto.KetQuaDoAm,
        dto.DoAm,
        dto.DiemTrungBinh,
        dto.SoLuongThucTe,
        dto.NguoiXongCay,
        dto.TrongLuongVai,
      );

      return {
        success: true,
        message: 'Cập nhật xong cây thành công',
      };
    } catch (error) {
      this.logger.error(
        'lỗi khi update xong cây',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Có lỗi khi update xong cây vải');
    }
  }

  async taoPhieuKiemVaiAuto(
    dto: QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_RequestDTO,
  ): Promise<QM_PhieuKiemVai_TaoPhieuKiem_Auto_Mobile_ResponseDTO> {
    try {
      const result = await this.fabricInspectionRepository.taoPhieuKiemVaiAuto(
        dto.TKId,
        dto.MaCay,
      );

      if (!result || result.PKVID == null) {
        return {
          success: false,
          message: result?.ThongBao || 'Tạo phiếu kiểm vải thất bại',
          data: result ?? null,
        };
      }

      return {
        success: true,
        message: `${result.ThongBao}`,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi khi tạo phiếu kiểm vải auto',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Có lỗi khi tạo phiếu kiểm vải auto',
      );
    }
  }

  async taoPhieuKiemThuCong(
    dto: QM_PhieuKiemVai_TaoPhieuKiem_RequestDTO,
  ): Promise<QM_PhieuKiemVai_TaoPhieuKiem_ResponseDTO> {
    try {
      const result = await this.fabricInspectionRepository.taoPhieuKiemThuCong(
        dto.TKId,
        dto.MaHang,
        dto.ChungLoai,
        dto.Item,
        dto.Art,
        dto.TenMau,
        dto.NgayKiemVai,
        dto.NhaCungCap,
        dto.LOT,
      );

      return {
        success: true,
        message: 'Tạo phiếu kiểm thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Lỗi tạo phiếu kiểm',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Có lỗi khi tạo phiếu kiểm');
    }
  }

  async layDanhSachMaHang(): Promise<QM_PhieuKiemVai_LayDanhSachMaHang_Web_ResponseDTO> {
    try {
      const result = await this.fabricInspectionRepository.layDanhSachMaHang();
      return {
        success: true,
        message: 'Lấy danh sách mã hàng thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách mã hàng thất bại',
        data: [],
      };
    }
  }

  async layDanhSachChungLoaiCoItem(
    MaHang: string,
    Item: string,
  ): Promise<layDanhSachChungLoaiCoItem_ResponseDTO> {
    try {
      const result =
        await this.fabricInspectionRepository.layDanhSachChungLoaiCoItem(
          MaHang,
          Item,
        );
      return {
        success: true,
        message: 'Lấy danh sách chủng loại thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách chủng loại thất bại',
        data: [],
      };
    }
  }

  async layDanhSachChungLoaiKoItem(
    MaHang: string,
  ): Promise<layDanhSachChungLoaiKoItem_ResponseDTO> {
    try {
      const result =
        await this.fabricInspectionRepository.layDanhSachChungLoaiKoItem(
          MaHang,
        );
      return {
        success: true,
        message: 'Lấy danh sách chủng loại thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách chủng loại thất bại',
        data: [],
      };
    }
  }

  async layDanhSachItem(MaHang: string): Promise<layDanhSachItem_ResponseDTO> {
    try {
      const result =
        await this.fabricInspectionRepository.layDanhSachItem(MaHang);
      return {
        success: true,
        message: 'Lấy danh sách item thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách item thất bại',
        data: [],
      };
    }
  }

  async layMaMau(dto: layMaMau_RequestDTO): Promise<layMaMau_ResponseDTO> {
    try {
      const result = await this.fabricInspectionRepository.layMaMau(
        dto.MaHang,
        dto.Item,
        dto.ChungLoai,
      );

      return {
        success: true,
        message: 'Lấy mã màu thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy mã màu thất bại',
        data: [],
      };
    }
  }

  async layArt(MaHang: string): Promise<layArt_ResponseDTO> {
    try {
      const result = await this.fabricInspectionRepository.layArt(MaHang);
      return {
        success: true,
        message: 'Lấy ds Art thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách Art thất bại',
        data: [],
      };
    }
  }
}
