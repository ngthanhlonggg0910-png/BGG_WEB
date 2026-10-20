import {
  QM_PhieuKiemVai_TheoTKId_RequestDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_RequestDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_RequestDTO,
} from '../dtos/fabric-inspection-request.dto.js';
import {
  QM_PhieuKiemVai_TheoTKId_ResponseDTO,
  QM_PhieuKiemVai_CayVai_TheoPKVId_ResponseDTO,
  QM_PhieuKiemVai_Cay_ChiTiet_LayDanhSachLoi_ResponseDTO,
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
}
