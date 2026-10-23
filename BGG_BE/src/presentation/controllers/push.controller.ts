import { Body, Controller, Get, Headers, Post, ForbiddenException } from '@nestjs/common';
import { PushService } from '../../application/services/push.service.js';
import { PushAuthService } from '../../application/services/push-auth.service.js';

@Controller('push')
export class PushController {
  constructor(private readonly push: PushService, private readonly auth: PushAuthService) {}

  @Get('config')
  config() { return this.push.config(); }

  @Get('settings')
  async settings(@Headers('authorization') authorization?: string) {
    const tkId = this.auth.verify(authorization);
    return this.push.settings(tkId, this.auth.canManage(tkId));
  }

  @Post('recipients')
  recipients(@Headers('authorization') authorization: string, @Body() body: { tkIds?: unknown }) {
    const tkId = this.auth.verify(authorization);
    if (!this.auth.canManage(tkId)) throw new ForbiddenException('Không có quyền cấu hình người nhận.');
    return this.push.saveRecipients(body?.tkIds);
  }

  @Post('subscribe')
  subscribe(@Headers('authorization') authorization: string, @Body() body: unknown) {
    return this.push.subscribe(this.auth.verify(authorization), body);
  }

  @Post('unsubscribe')
  unsubscribe(@Headers('authorization') authorization: string, @Body() body: { endpoint?: unknown }) {
    return this.push.unsubscribe(this.auth.verify(authorization), body?.endpoint);
  }

  @Post('test')
  test(@Headers('authorization') authorization: string, @Body() body: { endpoint?: unknown }) {
    return this.push.test(this.auth.verify(authorization), body?.endpoint);
  }
}
