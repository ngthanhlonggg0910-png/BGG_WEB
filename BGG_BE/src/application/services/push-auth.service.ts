import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class PushAuthService {
  private secret() {
    return process.env.PUSH_AUTH_SECRET || process.env.PASSWORD_SECRET_KEY;
  }

  issue(tkId: number): string | undefined {
    const secret = this.secret();
    if (!secret) return undefined;
    const payload = Buffer.from(JSON.stringify({
      sub: tkId, exp: Math.floor(Date.now() / 1000) + 7 * 86400, purpose: 'web-push',
    })).toString('base64url');
    const signature = createHmac('sha256', secret).update(payload).digest('base64url');
    return `${payload}.${signature}`;
  }

  verify(authorization?: string): number {
    const secret = this.secret();
    try {
      if (!secret || !authorization?.startsWith('Bearer ')) throw new Error();
      const parts = authorization.slice(7).split('.');
      if (parts.length !== 2) throw new Error();
      const expected = createHmac('sha256', secret).update(parts[0]).digest();
      const actual = Buffer.from(parts[1], 'base64url');
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error();
      const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      if (data.purpose !== 'web-push' || !Number.isSafeInteger(data.sub) || data.sub <= 0 ||
          !Number.isFinite(data.exp) || data.exp <= Date.now() / 1000) throw new Error();
      return data.sub;
    } catch {
      throw new UnauthorizedException('Vui lòng đăng nhập lại để sử dụng thông báo.');
    }
  }

  canManage(tkId: number): boolean {
    const configured = process.env.PUSH_MANAGE_TK_IDS?.trim();
    // This application has no role model. Deployments may restrict this screen
    // to named account IDs; otherwise existing authenticated users can configure it.
    return !configured || configured.split(',').some(id => Number(id.trim()) === tkId);
  }
}
