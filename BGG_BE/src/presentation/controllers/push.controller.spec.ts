import { PushController } from './push.controller.js';
import { PushAuthService } from '../../application/services/push-auth.service.js';
import type { PushService } from '../../application/services/push.service.js';
import webPush from 'web-push';

describe('Push API account boundaries', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not accept a client-supplied account ID instead of a signed identity', async () => {
    vi.stubEnv('PUSH_AUTH_SECRET', 'test-secret');
    const subscribe = vi.fn();
    const controller = new PushController(
      { subscribe } as unknown as PushService,
      new PushAuthService(),
    );
    expect(() =>
      controller.subscribe('', {
        tkId: 1,
        endpoint: 'https://fcm.googleapis.com/test',
      }),
    ).toThrow();
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('enforces manager restrictions before changing global recipients', () => {
    vi.stubEnv('PUSH_AUTH_SECRET', 'test-secret');
    vi.stubEnv('PUSH_MANAGE_TK_IDS', '1');
    const auth = new PushAuthService();
    const saveRecipients = vi.fn();
    const controller = new PushController(
      { saveRecipients } as unknown as PushService,
      auth,
    );
    expect(() =>
      controller.recipients(`Bearer ${auth.issue(2)}`, { tkIds: [2] }),
    ).toThrow();
    expect(saveRecipients).not.toHaveBeenCalled();
    controller.recipients(`Bearer ${auth.issue(1)}`, { tkIds: [2, 3] });
    expect(saveRecipients).toHaveBeenCalledWith([2, 3]);
  });

  it('only lets a signed account unsubscribe or test its own registration', () => {
    vi.stubEnv('PUSH_AUTH_SECRET', 'test-secret');
    const auth = new PushAuthService();
    const unsubscribe = vi.fn();
    const test = vi.fn();
    const controller = new PushController(
      { unsubscribe, test } as unknown as PushService,
      auth,
    );
    const authorization = `Bearer ${auth.issue(42)}`;
    controller.unsubscribe(authorization, { endpoint: 'endpoint' });
    controller.test(authorization, { endpoint: 'endpoint' });
    expect(unsubscribe).toHaveBeenCalledWith(42, 'endpoint');
    expect(test).toHaveBeenCalledWith(42, 'endpoint');
  });
});
