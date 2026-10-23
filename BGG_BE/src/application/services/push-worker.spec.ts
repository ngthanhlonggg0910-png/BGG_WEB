import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

function makeWorker(windows: unknown[] = []) {
  const handlers: Record<string, (event: any) => void> = {};
  const showNotification = vi.fn(async () => {});
  const openWindow = vi.fn(async () => {});
  const self = {
    location: { origin: 'https://wh.bgg.vn:8088' },
    addEventListener: (name: string, handler: (event: any) => void) => { handlers[name] = handler; },
    registration: { showNotification },
    clients: { matchAll: async () => windows, openWindow },
  };
  runInNewContext(readFileSync(resolve('../BGG_FE/public/push-events.js'), 'utf8'), { self, URL });
  async function dispatch(name: string, data: Record<string, unknown>) {
    let promise: Promise<unknown> = Promise.resolve();
    handlers[name]({ ...data, waitUntil: (work: Promise<unknown>) => { promise = work; } });
    await promise;
  }
  return { dispatch, showNotification, openWindow };
}

describe('Push service-worker events', () => {
  it('shows the order notification and retains the current origin including port', async () => {
    const worker = makeWorker();
    await worker.dispatch('push', { data: { json: () => ({ title: 'DDH42', body: 'MH001', tag: 'order42', url: '/production-orders?tab=ddh&orderId=42' }) } });
    expect(worker.showNotification).toHaveBeenCalledWith('DDH42', expect.objectContaining({
      body: 'MH001', tag: 'order42', data: { url: 'https://wh.bgg.vn:8088/production-orders?tab=ddh&orderId=42' },
    }));
  });

  it('shows a fallback on malformed JSON and rejects cross-origin navigation', async () => {
    const worker = makeWorker();
    await worker.dispatch('push', { data: { json: () => { throw new Error(); } } });
    expect(worker.showNotification).toHaveBeenCalledTimes(1);
    await worker.dispatch('push', { data: { json: () => ({ url: 'https://evil.test/' }) } });
    expect(worker.showNotification.mock.calls[1][1].data.url).toBe('https://wh.bgg.vn:8088/production-orders?tab=ddh');
    await worker.dispatch('notificationclick', { notification: { close: vi.fn(), data: { url: 'https://evil.test/' } } });
    expect(worker.openWindow).not.toHaveBeenCalled();
  });

  it('reuses an existing app window and focuses the requested order', async () => {
    const navigate = vi.fn(async () => {});
    const focus = vi.fn(async () => {});
    const worker = makeWorker([{ url: 'https://wh.bgg.vn:8088/home', navigate, focus }]);
    await worker.dispatch('notificationclick', { notification: { close: vi.fn(), data: { url: '/production-orders?tab=ddh&orderId=42' } } });
    expect(navigate).toHaveBeenCalledWith('https://wh.bgg.vn:8088/production-orders?tab=ddh&orderId=42');
    expect(focus).toHaveBeenCalledOnce();
    expect(worker.openWindow).not.toHaveBeenCalled();
  });
});
