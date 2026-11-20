import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  InspectionConfirmRepository,
  type NguoiThaoTac,
} from '../../infrastructure/repositories/inspection-confirm.repository.js';

export type InspectionConfirmCode =
  | 'OK'
  | 'TRANG_THAI'
  | 'THUOC_PHIEU_TONG'
  | 'VUOT_CHUNG_TU'
  | 'THIEU_KHO'
  | 'CHUA_GIAM_DINH'
  | 'DA_KIEM_VAI'
  | 'DA_XUAT';

export interface InspectionConfirmResponse {
  success: boolean;
  code: InspectionConfirmCode;
  message: string;
  /** Rows explaining why the action was blocked (or that need confirmation). */
  rows?: Record<string, unknown>[];
  trangThai?: string;
}

export interface InspectionStatusResponse {
  success: true;
  data: {
    PGDId: number;
    MaPhieu: string;
    TrangThai: string;
    LoaiGiamDinh: string;
    ThuocPhieuTong: boolean;
    quyenXacNhan: boolean;
    quyenHuyXacNhan: boolean;
    coTheXacNhan: boolean;
    coTheHuyXacNhan: boolean;
  };
}

const TEN_TRANG_THAI: Record<string, string> = {
  MOITAO: 'Mới tạo',
  CHOKIEM: 'Chờ kiểm',
  DAXACNHAN: 'Đã xác nhận',
  HUYXACNHAN: 'Hủy xác nhận',
  HUY: 'Hủy',
};

function tenTrangThai(code: string): string {
  return TEN_TRANG_THAI[code] ?? code ?? '';
}

function parsePgdId(value: unknown): number {
  const pgdId = Number(value);
  if (!Number.isSafeInteger(pgdId) || pgdId <= 0) {
    throw new BadRequestException('Thiếu hoặc sai PGDId');
  }
  return pgdId;
}

@Injectable()
export class InspectionConfirmService {
  private readonly logger = new Logger(InspectionConfirmService.name);

  constructor(private readonly repo: InspectionConfirmRepository) {}

  async getQuyen(
    tkId: number,
  ): Promise<{ success: true; data: { quyenXacNhan: boolean; quyenHuyXacNhan: boolean } }> {
    const quyen = await this.repo.getPermissions(tkId);
    return {
      success: true,
      data: { quyenXacNhan: quyen.xacNhan, quyenHuyXacNhan: quyen.huyXacNhan },
    };
  }

  async getStatus(pgdIdInput: unknown, tkId: number): Promise<InspectionStatusResponse> {
    const pgdId = parsePgdId(pgdIdInput);
    const [phieu, quyen] = await Promise.all([
      this.repo.getPhieuInfo(pgdId),
      this.repo.getPermissions(tkId),
    ]);
    if (!phieu) throw new NotFoundException('Không tìm thấy phiếu giám định');

    return {
      success: true,
      data: {
        ...phieu,
        quyenXacNhan: quyen.xacNhan,
        quyenHuyXacNhan: quyen.huyXacNhan,
        coTheXacNhan:
          quyen.xacNhan &&
          !phieu.ThuocPhieuTong &&
          phieu.TrangThai !== 'HUY' &&
          phieu.TrangThai !== 'DAXACNHAN',
        coTheHuyXacNhan:
          quyen.huyXacNhan && !phieu.ThuocPhieuTong && phieu.TrangThai === 'DAXACNHAN',
      },
    };
  }

  private async nguoiCoQuyen(
    tkId: number,
    quyen: 'xacNhan' | 'huyXacNhan',
  ): Promise<NguoiThaoTac> {
    const permissions = await this.repo.getPermissions(tkId);
    if (!permissions[quyen]) {
      throw new ForbiddenException(
        quyen === 'xacNhan'
          ? 'Tài khoản không có quyền Xác nhận phiếu giám định'
          : 'Tài khoản không có quyền Hủy xác nhận phiếu giám định',
      );
    }
    const nguoi = await this.repo.getNguoiThaoTac(tkId);
    if (!nguoi) throw new ForbiddenException('Không tìm thấy tài khoản đăng nhập');
    return nguoi;
  }

  async xacNhan(
    pgdIdInput: unknown,
    tkId: number,
    xoaDongChuaGiamDinh: unknown,
  ): Promise<InspectionConfirmResponse> {
    const pgdId = parsePgdId(pgdIdInput);
    const nguoi = await this.nguoiCoQuyen(tkId, 'xacNhan');

    let result;
    try {
      result = await this.repo.xacNhan(pgdId, nguoi, xoaDongChuaGiamDinh === true);
    } catch (error) {
      this.logger.error(
        `Lỗi xác nhận phiếu giám định ${pgdId}`,
        error instanceof Error ? error.stack : String(error),
      );
      const fkConflict = (error as { number?: number })?.number === 547;
      throw new InternalServerErrorException(
        fkConflict
          ? 'Không xóa được dòng chưa giám định vì dữ liệu đang được dùng ở nơi khác (ví dụ tem QR nguyên liệu). Phiếu chưa được xác nhận.'
          : 'Có lỗi khi xác nhận phiếu giám định. Phiếu chưa được xác nhận.',
      );
    }

    switch (result.status) {
      case 'not_found':
        throw new NotFoundException('Không tìm thấy phiếu giám định');
      case 'thuoc_phieu_tong':
        return {
          success: false,
          code: 'THUOC_PHIEU_TONG',
          message: 'Phiếu này thuộc phiếu giám định tổng, vui lòng xác nhận phiếu tổng trên desktop.',
        };
      case 'invalid_state':
        return {
          success: false,
          code: 'TRANG_THAI',
          trangThai: result.trangThai,
          message: `Phiếu đang ở trạng thái "${tenTrangThai(result.trangThai)}", không thể xác nhận.`,
        };
      case 'vuot_chung_tu':
        return {
          success: false,
          code: 'VUOT_CHUNG_TU',
          rows: result.rows,
          message: 'Có dòng giám định có số lượng vượt so với chứng từ.',
        };
      case 'thieu_kho':
        return {
          success: false,
          code: 'THIEU_KHO',
          rows: result.rows,
          message: 'Có nguyên vật liệu chưa được cập nhật Khổ (cm) hoặc Khổ inch.',
        };
      case 'chua_giam_dinh':
        return {
          success: false,
          code: 'CHUA_GIAM_DINH',
          rows: result.rows,
          message: `Có ${result.rows.length} dòng nguyên phụ liệu chưa được giám định. Xóa những dòng này để xác nhận phiếu?`,
        };
      case 'confirmed': {
        const parts = [`Đã xác nhận phiếu giám định (người giám định: ${nguoi.hoTen})`];
        if (result.daXoaDong > 0) parts.push(`đã xóa ${result.daXoaDong} dòng chưa giám định`);
        parts.push(
          result.phieuNhapKho === 'created'
            ? 'đã tạo phiếu nhập kho'
            : 'phiếu nhập kho đã có từ trước',
        );
        return { success: true, code: 'OK', trangThai: 'DAXACNHAN', message: parts.join(', ') };
      }
    }
  }

  async huyXacNhan(pgdIdInput: unknown, tkId: number): Promise<InspectionConfirmResponse> {
    const pgdId = parsePgdId(pgdIdInput);
    const nguoi = await this.nguoiCoQuyen(tkId, 'huyXacNhan');

    let result;
    try {
      result = await this.repo.huyXacNhan(pgdId, nguoi);
    } catch (error) {
      this.logger.error(
        `Lỗi hủy xác nhận phiếu giám định ${pgdId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Có lỗi khi hủy xác nhận phiếu giám định. Trạng thái phiếu không thay đổi.',
      );
    }

    switch (result.status) {
      case 'not_found':
        throw new NotFoundException('Không tìm thấy phiếu giám định');
      case 'thuoc_phieu_tong':
        return {
          success: false,
          code: 'THUOC_PHIEU_TONG',
          message: 'Phiếu này thuộc phiếu giám định tổng, vui lòng hủy xác nhận phiếu tổng trên desktop.',
        };
      case 'invalid_state':
        return {
          success: false,
          code: 'TRANG_THAI',
          trangThai: result.trangThai,
          message: `Phiếu đang ở trạng thái "${tenTrangThai(result.trangThai)}", chỉ hủy xác nhận được phiếu đã xác nhận.`,
        };
      case 'da_kiem_vai':
        return {
          success: false,
          code: 'DA_KIEM_VAI',
          message: `Đã có ${result.soCay} cây vải được kiểm chất lượng, vui lòng kiểm tra lại với QA.`,
        };
      case 'da_xuat':
        return {
          success: false,
          code: 'DA_XUAT',
          rows: result.rows,
          message: 'Không thể hủy xác nhận vì có vật tư đã xuất kho.',
        };
      case 'cancelled':
        return {
          success: true,
          code: 'OK',
          trangThai: 'HUYXACNHAN',
          message: 'Đã hủy xác nhận phiếu giám định',
        };
    }
  }
}
