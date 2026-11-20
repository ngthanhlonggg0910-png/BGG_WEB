import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';

import { InspectionConfirmService } from '../../application/services/inspection-confirm.service.js';
import type { AuthenticatedRequest } from '../guards/auth.guard.js';

/**
 * Xác nhận / hủy xác nhận phiếu giám định, same rules as the desktop app.
 * The acting account (and its permissions) always comes from the login token.
 */
@Controller('phieu-giam-dinh')
export class InspectionConfirmController {
  constructor(private readonly service: InspectionConfirmService) {}

  /** Quyền Xác nhận / Hủy xác nhận của tài khoản đang đăng nhập (dùng cho danh sách phiếu). */
  @Post('quyen')
  @HttpCode(200)
  quyen(@Req() req: AuthenticatedRequest) {
    return this.service.getQuyen(req.user!.tkId);
  }

  @Post('trang-thai')
  @HttpCode(200)
  trangThai(@Body('PGDId') pgdId: unknown, @Req() req: AuthenticatedRequest) {
    return this.service.getStatus(pgdId, req.user!.tkId);
  }

  @Post('xac-nhan')
  @HttpCode(200)
  xacNhan(
    @Body() body: { PGDId?: unknown; xoaDongChuaGiamDinh?: unknown },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.xacNhan(body?.PGDId, req.user!.tkId, body?.xoaDongChuaGiamDinh);
  }

  @Post('huy-xac-nhan')
  @HttpCode(200)
  huyXacNhan(@Body('PGDId') pgdId: unknown, @Req() req: AuthenticatedRequest) {
    return this.service.huyXacNhan(pgdId, req.user!.tkId);
  }
}
