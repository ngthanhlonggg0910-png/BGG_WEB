import { PushService, buildOrderPush, pushFailure, validateSubscription } from './push.service.js';
import type { DatabaseService } from '../../infrastructure/database/database.service.js';
import webPush from 'web-push';

vi.mock('web-push', () => ({ default: { setVapidDetails: vi.fn(), sendNotification: vi.fn() } }));

const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
  keys: { p256dh: Buffer.alloc(65, 4).toString('base64url'), auth: Buffer.alloc(16, 1).toString('base64url') },
};

describe('Web Push validation and order payloads', () => {
  it('accepts supported browsers but rejects arbitrary/private endpoints and malformed keys', () => {
    expect(validateSubscription(subscription)).toEqual(subscription);
    for (const endpoint of ['https://127.0.0.1/test', 'http://fcm.googleapis.com/test', 'https://fcm.googleapis.com.evil.test/test', 'https://user@fcm.googleapis.com/test', 'https://fcm.googleapis.com:3000/test']) {
      expect(() => validateSubscription({ ...subscription, endpoint })).toThrow();
    }
    expect(() => validateSubscription({ ...subscription, keys: { auth: 'bad' } })).toThrow();
  });

  it('links each split order to its own detail and uses a stable notification tag', () => {
    const first = buildOrderPush({ donDatHangId: 42, soDonDatHang: 'DDH42', loaiDatHang: 'NguyenLieu' }, 'MH001', 'Lan');
    const second = buildOrderPush({ donDatHangId: 43, soDonDatHang: 'DDH43', loaiDatHang: 'PhuLieu' }, 'MH001', 'Lan');
    expect(first.url).toBe('/production-orders?tab=ddh&orderId=42');
    expect(first.body).toContain('MH001');
    expect(first.body).toContain('Lan');
    expect(first.tag).not.toBe(second.tag);
    expect(second.body).toContain('Phụ liệu');
  });

  it('distinguishes expired subscriptions, transient failures and permanent failures', () => {
    expect(pushFailure(410)).toBe('expired');
    expect(pushFailure(404)).toBe('expired');
    expect(pushFailure(429)).toBe('retry');
    expect(pushFailure(503)).toBe('retry');
    expect(pushFailure()).toBe('retry');
    expect(pushFailure(403)).toBe('failed');
  });
});

describe('Persistent delivery worker', () => {
  const row = { Id: 1, DonDatHangId: 42, EndpointHash: 'hash', TKId: 9, Payload: '{"title":"New order"}', Attempts: 1, CreatedAt: new Date() };

  function makeService(deviceExists = true, attempts = 1) {
    const updates: Record<string, unknown>[] = [];
    let deletions = 0;
    const query = vi.fn(async (text: string, values: Record<string, unknown>) => {
      if (text.includes('OUTPUT inserted.*')) return { recordset: [{ ...row, Attempts: attempts }] };
      if (text.includes('SELECT s.Subscription')) return { recordset: deviceExists ? [{ Subscription: JSON.stringify(subscription) }] : [] };
      if (text.includes('DELETE FROM dbo.BGG_WebPushSubscriptions')) deletions++;
      if (text.includes('UPDATE dbo.BGG_WebPushOutbox SET')) updates.push(values);
      return { recordset: [] };
    });
    const database = { getPool: async () => ({ request: () => {
      const values: Record<string, unknown> = {};
      const request = { input: (name: string, _type: unknown, value: unknown) => { values[name] = value; return request; }, query: (text: string) => query(text, values) };
      return request;
    } }) };
    const service = new PushService(database as unknown as DatabaseService);
    // Isolate the worker from startup/timers; database behavior is mocked above.
    (service as unknown as { ready: boolean }).ready = true;
    return { service, updates, query, deletions: () => deletions };
  }

  beforeEach(() => { vi.mocked(webPush.sendNotification).mockReset(); });

  it('sends to a selected, still-owned subscription and marks it sent', async () => {
    const { service, updates } = makeService();
    vi.mocked(webPush.sendNotification).mockResolvedValue({ statusCode: 201, body: '', headers: {} });
    await service.drain();
    expect(webPush.sendNotification).toHaveBeenCalledTimes(1);
    expect(updates[0].State).toBe('sent');
  });

  it('skips a device removed, reassigned or deselected before delivery', async () => {
    const { service, updates } = makeService(false);
    await service.drain();
    expect(webPush.sendNotification).not.toHaveBeenCalled();
    expect(updates[0].State).toBe('skipped');
  });

  it('retries network failures but stops after the last attempt', async () => {
    vi.mocked(webPush.sendNotification).mockRejectedValue(new Error('offline'));
    const retry = makeService();
    await retry.service.drain();
    expect(retry.updates[0].State).toBe('pending');
    const last = makeService(true, 8);
    await last.service.drain();
    expect(last.updates[0].State).toBe('failed');
  });

  it('removes expired subscriptions and does not retry them', async () => {
    vi.mocked(webPush.sendNotification).mockRejectedValue({ statusCode: 410 });
    const { service, updates, deletions } = makeService();
    await service.drain();
    expect(updates[0].State).toBe('failed');
    expect(deletions()).toBe(1);
  });

  it('does not enqueue when Web Push is disabled', async () => {
    const database = { getPool: vi.fn() };
    const service = new PushService(database as unknown as DatabaseService);
    await service.enqueueOrders(null as never, [], null as never);
    expect(database.getPool).not.toHaveBeenCalled();
    expect(service.config().enabled).toBe(false);
  });
});
