import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

const PURPOSE = 'session';
const DEFAULT_TTL_HOURS = 24;

/**
 * Signed, stateless login token: base64url(payload).base64url(HMAC-SHA256).
 * Same shape as the web-push token, but with its own purpose so the two can
 * never be swapped for each other.
 */
@Injectable()
export class AuthTokenService {
  private secret(): string {
    const secret = process.env.AUTH_TOKEN_SECRET || process.env.PASSWORD_SECRET_KEY;
    if (!secret) throw new Error('AUTH_TOKEN_SECRET / PASSWORD_SECRET_KEY is missing');
    return secret;
  }

  private ttlSeconds(): number {
    const hours = Number(process.env.AUTH_TOKEN_TTL_HOURS);
    return Math.round((Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_TTL_HOURS) * 3600);
  }

  private sign(payload: string): Buffer {
    return createHmac('sha256', this.secret()).update(payload).digest();
  }

  issue(tkId: number | string): string {
    // mssql returns BIGINT columns (TKId) as strings; the token must carry a number
    // or verify() rejects it and every request after login gets 401.
    const sub = Number(tkId);
    if (!Number.isSafeInteger(sub) || sub <= 0) {
      throw new Error(`Invalid TKId for login token: ${String(tkId)}`);
    }
    const payload = Buffer.from(
      JSON.stringify({
        sub,
        exp: Math.floor(Date.now() / 1000) + this.ttlSeconds(),
        purpose: PURPOSE,
      }),
    ).toString('base64url');
    return `${payload}.${this.sign(payload).toString('base64url')}`;
  }

  /** Returns the TKId carried by a valid `Bearer <token>` header, or throws 401. */
  verify(authorization?: string): number {
    try {
      if (!authorization?.startsWith('Bearer ')) throw new Error();
      const parts = authorization.slice(7).trim().split('.');
      if (parts.length !== 2) throw new Error();
      const expected = this.sign(parts[0]);
      const actual = Buffer.from(parts[1], 'base64url');
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        throw new Error();
      }
      const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      if (
        data.purpose !== PURPOSE ||
        !Number.isSafeInteger(data.sub) ||
        data.sub <= 0 ||
        !Number.isFinite(data.exp) ||
        data.exp <= Date.now() / 1000
      ) {
        throw new Error();
      }
      return data.sub;
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }
}
