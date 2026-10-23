import { PushAuthService } from './push-auth.service.js';

describe('PushAuthService', () => {
  beforeEach(() => { vi.stubEnv('PUSH_AUTH_SECRET', 'test-secret-for-push-only'); });
  afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

  it('signs account identity and rejects a forged account or missing bearer token', () => {
    const service = new PushAuthService();
    const token = service.issue(123)!;
    expect(service.verify(`Bearer ${token}`)).toBe(123);
    const forged = Buffer.from(JSON.stringify({ sub: 999, exp: 9999999999, purpose: 'web-push' })).toString('base64url') + '.' + token.split('.')[1];
    expect(() => service.verify(`Bearer ${forged}`)).toThrow();
    expect(() => service.verify()).toThrow();
    expect(() => service.verify('Bearer a.b.c')).toThrow();
  });

  it('expires the notification session after seven days', () => {
    vi.useFakeTimers();
    const service = new PushAuthService();
    const token = service.issue(5);
    vi.advanceTimersByTime(7 * 86400000 + 1);
    expect(() => service.verify(`Bearer ${token}`)).toThrow();
  });

  it('honors the optional list of accounts allowed to manage recipients', () => {
    const service = new PushAuthService();
    vi.stubEnv('PUSH_MANAGE_TK_IDS', '1, 2');
    expect(service.canManage(1)).toBe(true);
    expect(service.canManage(3)).toBe(false);
    vi.stubEnv('PUSH_MANAGE_TK_IDS', '');
    expect(service.canManage(3)).toBe(true);
  });
});
