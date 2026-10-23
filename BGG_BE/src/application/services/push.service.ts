import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createHash } from 'node:crypto';
import sql from 'mssql';
import webPush from 'web-push';
import { DatabaseService } from '../../infrastructure/database/database.service.js';
import type { CreateMaterialOrderDto } from '../dtos/production-order.dto.js';

export function validateSubscription(value: unknown): webPush.PushSubscription {
  const sub = value as webPush.PushSubscription;
  try {
    if (!sub || typeof sub.endpoint !== 'string' || sub.endpoint.length > 2048) throw new Error();
    const url = new URL(sub.endpoint);
    const trusted = url.hostname === 'fcm.googleapis.com' ||
      url.hostname.endsWith('.push.apple.com') ||
      url.hostname.endsWith('.notify.windows.com') ||
      url.hostname.endsWith('.push.services.mozilla.com');
    if (!trusted || url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) throw new Error();
    if (!/^[\w-]+$/.test(sub.keys?.p256dh) || Buffer.from(sub.keys.p256dh, 'base64url').length !== 65 ||
        !/^[\w-]+$/.test(sub.keys?.auth) || Buffer.from(sub.keys.auth, 'base64url').length !== 16) throw new Error();
    return { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } };
  } catch {
    throw new BadRequestException('Đăng ký thông báo không hợp lệ hoặc trình duyệt chưa được hỗ trợ.');
  }
}

export function buildOrderPush(order: { donDatHangId: number; soDonDatHang: string; loaiDatHang: string }, maHang: string, nguoiDat: string) {
  return {
    title: `Đơn đặt hàng mới: ${order.soDonDatHang}`,
    body: `${order.loaiDatHang === 'NguyenLieu' ? 'Nguyên liệu' : 'Phụ liệu'} · Mã hàng: ${maHang || '—'} · Người đặt: ${nguoiDat || '—'}`,
    tag: `material-order-${order.donDatHangId}`,
    url: `/production-orders?tab=ddh&orderId=${order.donDatHangId}`,
  };
}

export function pushFailure(statusCode?: number) {
  if (statusCode === 404 || statusCode === 410) return 'expired';
  if (!statusCode || statusCode === 429 || statusCode >= 500) return 'retry';
  return 'failed';
}

@Injectable()
export class PushService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PushService.name);
  private timer?: ReturnType<typeof setInterval>;
  private processing = false;
  private ready = false;
  private readonly requested = process.env.PUSH_ENABLED === 'true';

  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    if (!this.requested) return;
    const { VAPID_PUBLIC_KEY: publicKey, VAPID_PRIVATE_KEY: privateKey, VAPID_SUBJECT: subject } = process.env;
    if (!publicKey || !privateKey || !subject || !(process.env.PUSH_AUTH_SECRET || process.env.PASSWORD_SECRET_KEY)) {
      throw new Error('PUSH_ENABLED requires VAPID keys, VAPID_SUBJECT and an authentication secret. See PUSH.md.');
    }
    webPush.setVapidDetails(subject, publicKey, privateKey);
    const pool = await this.database.getPool();
    // Fail configuration explicitly rather than silently lose notifications.
    await pool.request().query('SELECT TOP (0) * FROM dbo.BGG_WebPushOutbox; SELECT TOP (0) LastTestAt FROM dbo.BGG_WebPushSubscriptions; SELECT TOP (0) * FROM dbo.BGG_WebPushRecipients;');
    this.ready = true;
    this.timer = setInterval(() => { void this.drain(); }, 5000);
    this.timer.unref();
    void this.drain();
  }

  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  config() { return { enabled: this.ready, publicKey: this.ready ? process.env.VAPID_PUBLIC_KEY : null }; }
  private requireReady() {
    if (!this.ready) throw new ServiceUnavailableException('Máy chủ chưa bật thông báo. Vui lòng liên hệ người quản lý hệ thống.');
  }
  private hash(endpoint: string) { return createHash('sha256').update(endpoint).digest('hex'); }

  async settings(tkId: number, canManage: boolean) {
    this.requireReady();
    const pool = await this.database.getPool();
    const self = await pool.request().input('TKId', sql.Int, tkId).query(`
      SELECT COUNT(*) AS Devices FROM dbo.BGG_WebPushSubscriptions WHERE TKId=@TKId;
      SELECT TKId FROM dbo.BGG_WebPushRecipients WHERE TKId=@TKId;
    `);
    const accounts = canManage ? (await pool.request().query(`
      SELECT u.TKId, u.TenDangNhap,
        CASE WHEN r.TKId IS NULL THEN 0 ELSE 1 END AS Selected,
        (SELECT COUNT(*) FROM dbo.BGG_WebPushSubscriptions s WHERE s.TKId=u.TKId) AS Devices
      FROM dbo.Lib_NhanVien_TaiKhoan u
      LEFT JOIN dbo.BGG_WebPushRecipients r ON r.TKId=u.TKId
      ORDER BY u.TenDangNhap;
    `)).recordset : [];
    const recordsets = self.recordsets as sql.IRecordSet<{ Devices: number; TKId: number }>[];
    return { canManage, accounts, selected: recordsets[1].length > 0, devices: recordsets[0][0].Devices };
  }

  async saveRecipients(value: unknown) {
    this.requireReady();
    if (!Array.isArray(value) || value.length > 2000 || value.some(id => !Number.isSafeInteger(id) || id <= 0)) {
      throw new BadRequestException('Danh sách tài khoản không hợp lệ.');
    }
    const ids = [...new Set(value as number[])];
    const pool = await this.database.getPool();
    const request = pool.request();
    ids.forEach((id, index) => request.input(`Id${index}`, sql.Int, id));
    // Bound parameters, not OPENJSON: the existing database uses compatibility 120.
    const insert = ids.length ? `INSERT @Selected(TKId) VALUES ${ids.map((_, index) => `(@Id${index})`).join(',')};` : '';
    try {
      await request.query(`
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;
        DECLARE @Selected TABLE (TKId int PRIMARY KEY);
        ${insert}
        IF EXISTS (SELECT TKId FROM @Selected WHERE TKId NOT IN (SELECT TKId FROM dbo.Lib_NhanVien_TaiKhoan))
        BEGIN ROLLBACK; THROW 50000, 'Invalid account ID', 1; END;
        DELETE FROM dbo.BGG_WebPushRecipients WITH (TABLOCKX);
        INSERT dbo.BGG_WebPushRecipients(TKId) SELECT TKId FROM @Selected;
        COMMIT;
      `);
    } catch (error) {
      if ((error as { number?: number }).number === 50000) throw new BadRequestException('Có tài khoản không còn tồn tại. Vui lòng tải lại danh sách.');
      throw error;
    }
    return { success: true, count: ids.length };
  }

  async subscribe(tkId: number, value: unknown) {
    this.requireReady();
    const subscription = validateSubscription(value);
    const pool = await this.database.getPool();
    await pool.request().input('Hash', sql.VarChar(64), this.hash(subscription.endpoint)).input('TKId', sql.Int, tkId)
      .input('Subscription', sql.NVarChar(sql.MAX), JSON.stringify(subscription)).query(`
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;
        UPDATE dbo.BGG_WebPushSubscriptions WITH (UPDLOCK, SERIALIZABLE)
        SET TKId=@TKId, Subscription=@Subscription, UpdatedAt=SYSUTCDATETIME() WHERE EndpointHash=@Hash;
        IF @@ROWCOUNT=0 INSERT dbo.BGG_WebPushSubscriptions(EndpointHash,TKId,Subscription) VALUES(@Hash,@TKId,@Subscription);
        COMMIT;
      `);
    return { success: true };
  }

  async unsubscribe(tkId: number, endpoint: unknown) {
    this.requireReady();
    if (typeof endpoint !== 'string' || endpoint.length > 2048) throw new BadRequestException('Thiếu thiết bị nhận thông báo.');
    const pool = await this.database.getPool();
    await pool.request().input('Hash', sql.VarChar(64), this.hash(endpoint)).input('TKId', sql.Int, tkId)
      .query('DELETE FROM dbo.BGG_WebPushSubscriptions WHERE EndpointHash=@Hash AND TKId=@TKId;');
    return { success: true };
  }

  async test(tkId: number, endpoint: unknown) {
    this.requireReady();
    if (typeof endpoint !== 'string') throw new BadRequestException('Vui lòng bật thông báo trên thiết bị này trước.');
    const pool = await this.database.getPool();
    const result = await pool.request().input('TKId', sql.Int, tkId).input('Hash', sql.VarChar(64), this.hash(endpoint)).query(`
      SELECT Subscription, UpdatedAt FROM dbo.BGG_WebPushSubscriptions WHERE TKId=@TKId AND EndpointHash=@Hash;
    `);
    const device = result.recordset[0];
    if (!device) throw new BadRequestException('Thiết bị chưa đăng ký thông báo.');
    // Throttle each device using SQL so multiple API instances share the limit.
    const throttle = await pool.request().input('Hash', sql.VarChar(64), this.hash(endpoint)).input('TKId', sql.Int, tkId).query(`
      UPDATE dbo.BGG_WebPushSubscriptions SET LastTestAt=SYSUTCDATETIME()
      WHERE EndpointHash=@Hash AND TKId=@TKId AND (LastTestAt IS NULL OR LastTestAt < DATEADD(second,-10,SYSUTCDATETIME()));
    `);
    if (!throttle.rowsAffected[0]) throw new BadRequestException('Vui lòng đợi 10 giây rồi gửi thử lại.');
    try {
      await webPush.sendNotification(JSON.parse(device.Subscription), JSON.stringify({ title: 'Đã bật thông báo BGG', body: 'Thiết bị này đã sẵn sàng nhận thông báo đơn đặt hàng.', tag: 'bgg-push-test', url: '/infor' }), { TTL: 60, timeout: 10000 });
    } catch (error) {
      if (pushFailure((error as { statusCode?: number }).statusCode) === 'expired') await this.unsubscribe(tkId, endpoint);
      throw new ServiceUnavailableException('Chưa gửi được thông báo thử. Hãy bật lại thông báo hoặc thử sau.');
    }
    return { success: true };
  }

  // Called inside the material-order transaction. A rollback removes both the
  // order and its deliveries. Split orders each have their own stable tag.
  async enqueueOrders(tx: sql.Transaction, orders: Array<{ donDatHangId: number; soDonDatHang: string; loaiDatHang: string }>, dto: CreateMaterialOrderDto) {
    if (!this.ready) return;
    const result = await new sql.Request(tx).input('LSXId', sql.Int, dto.lsxId).query('SELECT MaHang FROM dbo.OMM_LenhSanXuat WHERE LSXId=@LSXId;');
    for (const order of orders) {
      const payload = buildOrderPush(order, result.recordset[0]?.MaHang, dto.nguoiDat);
      await new sql.Request(tx).input('Id', sql.Int, order.donDatHangId).input('Payload', sql.NVarChar(sql.MAX), JSON.stringify(payload)).query(`
        INSERT dbo.BGG_WebPushOutbox(DonDatHangId,EndpointHash,TKId,Payload)
        SELECT @Id,s.EndpointHash,s.TKId,@Payload FROM dbo.BGG_WebPushSubscriptions s
        INNER JOIN dbo.BGG_WebPushRecipients r ON r.TKId=s.TKId
        WHERE NOT EXISTS (SELECT 1 FROM dbo.BGG_WebPushOutbox q WHERE q.DonDatHangId=@Id AND q.EndpointHash=s.EndpointHash);
      `);
    }
  }

  async drain() {
    if (!this.ready || this.processing) return;
    this.processing = true;
    try {
      const pool = await this.database.getPool();
      const batch = await pool.request().query(`
        ;WITH batch AS (
          SELECT TOP (20) * FROM dbo.BGG_WebPushOutbox WITH (UPDLOCK,READPAST,READCOMMITTEDLOCK)
          WHERE ((State='pending' AND NextAttemptAt<=SYSUTCDATETIME()) OR (State='sending' AND LeaseUntil<SYSUTCDATETIME()))
          ORDER BY Id
        )
        UPDATE batch SET State='sending', Attempts=Attempts+1, LeaseUntil=DATEADD(second,300,SYSUTCDATETIME()) OUTPUT inserted.*;
      `);
      await Promise.all(batch.recordset.map(row => this.deliver(row)));
    } catch (error) {
      this.logger.error(`Push queue unavailable: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally { this.processing = false; }
  }

  private async deliver(row: { Id: number; EndpointHash: string; TKId: number; Payload: string; Attempts: number; CreatedAt: Date }) {
    const pool = await this.database.getPool();
    let state = 'sent';
    let lastError: string | null = null;
    const device = (await pool.request().input('Hash', sql.VarChar(64), row.EndpointHash).input('TKId', sql.Int, row.TKId).query(`
      SELECT s.Subscription FROM dbo.BGG_WebPushSubscriptions s
      INNER JOIN dbo.BGG_WebPushRecipients r ON r.TKId=s.TKId
      WHERE s.EndpointHash=@Hash AND s.TKId=@TKId;
    `)).recordset[0];
    if (!device || Date.now() - new Date(row.CreatedAt).getTime() > 86400000) state = 'skipped';
    else {
      try {
        await webPush.sendNotification(JSON.parse(device.Subscription), row.Payload, { TTL: 86400, timeout: 10000 });
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        const outcome = pushFailure(status);
        // Do not persist endpoints, keys or upstream response bodies in logs.
        lastError = status ? `HTTP ${status}` : 'Network error';
        state = outcome === 'retry' && row.Attempts < 8 ? 'pending' : 'failed';
        if (outcome === 'expired') {
          await pool.request().input('Hash', sql.VarChar(64), row.EndpointHash).input('TKId', sql.Int, row.TKId)
            .query('DELETE FROM dbo.BGG_WebPushSubscriptions WHERE EndpointHash=@Hash AND TKId=@TKId;');
        }
      }
    }
    await pool.request().input('Id', sql.BigInt, row.Id).input('State', sql.VarChar(12), state)
      .input('Error', sql.NVarChar(300), lastError).input('Delay', sql.Int, Math.min(3600, 15 * 2 ** row.Attempts)).query(`
        UPDATE dbo.BGG_WebPushOutbox SET State=@State, LastError=@Error, LeaseUntil=NULL,
          NextAttemptAt=DATEADD(second,@Delay,SYSUTCDATETIME()) WHERE Id=@Id;
      `);
  }
}
