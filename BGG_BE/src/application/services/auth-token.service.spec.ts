import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';

import { AuthTokenService } from './auth-token.service.js';
import { PushAuthService } from './push-auth.service.js';
import { AuthGuard } from '../../presentation/guards/auth.guard.js';
import { IS_PUBLIC_KEY } from '../../presentation/guards/public.decorator.js';

describe('AuthTokenService', () => {
  beforeEach(() => {
    vi.stubEnv('AUTH_TOKEN_SECRET', 'test-secret-for-login');
    vi.stubEnv('PUSH_AUTH_SECRET', 'test-secret-for-login');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('round-trips the account id and rejects forged or malformed tokens', () => {
    const service = new AuthTokenService();
    const token = service.issue(42);
    expect(service.verify(`Bearer ${token}`)).toBe(42);

    const forged =
      Buffer.from(JSON.stringify({ sub: 1, exp: 9999999999, purpose: 'session' })).toString('base64url') +
      '.' +
      token.split('.')[1];
    expect(() => service.verify(`Bearer ${forged}`)).toThrow();
    expect(() => service.verify()).toThrow();
    expect(() => service.verify(token)).toThrow();
    expect(() => service.verify('Bearer a.b.c')).toThrow();
  });

  it('accepts TKId as the string mssql returns for BIGINT columns', () => {
    const service = new AuthTokenService();
    expect(service.verify(`Bearer ${service.issue('15' as unknown as number)}`)).toBe(15);
    expect(new PushAuthService().verify(`Bearer ${new PushAuthService().issue('15' as unknown as number)}`)).toBe(15);
    expect(() => service.issue('abc' as unknown as number)).toThrow();
  });

  it('does not accept a web-push token as a login token', () => {
    const pushToken = new PushAuthService().issue(42)!;
    expect(() => new AuthTokenService().verify(`Bearer ${pushToken}`)).toThrow();
  });

  it('expires after AUTH_TOKEN_TTL_HOURS', () => {
    vi.stubEnv('AUTH_TOKEN_TTL_HOURS', '2');
    vi.useFakeTimers();
    const service = new AuthTokenService();
    const token = service.issue(7);
    vi.advanceTimersByTime(2 * 3600_000 - 1000);
    expect(service.verify(`Bearer ${token}`)).toBe(7);
    vi.advanceTimersByTime(2000);
    expect(() => service.verify(`Bearer ${token}`)).toThrow();
  });
});

describe('AuthGuard', () => {
  beforeEach(() => vi.stubEnv('AUTH_TOKEN_SECRET', 'test-secret-for-login'));
  afterEach(() => vi.unstubAllEnvs());

  function context(isPublic: boolean, authorization?: string) {
    const request: { headers: Record<string, string | undefined>; user?: { tkId: number } } = {
      headers: { authorization },
    };
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) =>
      key === IS_PUBLIC_KEY ? isPublic : undefined,
    );
    const ctx = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { reflector, ctx, request };
  }

  it('lets @Public routes through without a token', () => {
    const { reflector, ctx } = context(true);
    expect(new AuthGuard(reflector, new AuthTokenService()).canActivate(ctx)).toBe(true);
  });

  it('rejects protected routes without a valid token', () => {
    const { reflector, ctx } = context(false);
    expect(() => new AuthGuard(reflector, new AuthTokenService()).canActivate(ctx)).toThrow();
  });

  it('attaches the account id from a valid token', () => {
    const tokens = new AuthTokenService();
    const { reflector, ctx, request } = context(false, `Bearer ${tokens.issue(9)}`);
    expect(new AuthGuard(reflector, tokens).canActivate(ctx)).toBe(true);
    expect(request.user).toEqual({ tkId: 9 });
  });
});
