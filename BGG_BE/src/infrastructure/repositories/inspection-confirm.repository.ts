import { Injectable } from '@nestjs/common';
import sql from 'mssql';

import { DatabaseService } from '../database/database.service.js';

/** Desktop permission rows (SYS_ChucNangChiTiet) for the inspection detail form. */
const PERMISSION_FORM = 'frmChiTietPhieu';
const PERMISSION_XAC_NHAN = 'btnXacNhan';
const PERMISSION_HUY_XAC_NHAN = 'btnHuyXacNhan';

export interface PhieuGiamDinhInfo {
  PGDId: number;
  MaPhieu: string;
  TrangThai: string;
  LoaiGiamDinh: string;
  /** The phiếu belongs to a phiếu giám định tổng; desktop confirms it from there. */
  ThuocPhieuTong: boolean;
}

export interface NguoiThaoTac {
  tkId: number;
  hoTen: string;
  tenDangNhap: string;
}

export type XacNhanResult =
  | { status: 'not_found' }
  | { status: 'invalid_state'; trangThai: string }
  | { status: 'thuoc_phieu_tong' }
  | { status: 'vuot_chung_tu'; rows: Record<string, unknown>[] }
  | { status: 'thieu_kho'; rows: Record<string, unknown>[] }
  | { status: 'chua_giam_dinh'; rows: Record<string, unknown>[] }
  | { status: 'confirmed'; daXoaDong: number; phieuNhapKho: 'created' | 'existed' };

export type HuyXacNhanResult =
  | { status: 'not_found' }
  | { status: 'invalid_state'; trangThai: string }
  | { status: 'thuoc_phieu_tong' }
  | { status: 'da_kiem_vai'; soCay: number }
  | { status: 'da_xuat'; rows: Record<string, unknown>[] }
  | { status: 'cancelled' };

async function safeRollback(transaction: sql.Transaction): Promise<void> {
  try {
    await transaction.rollback();
  } catch {
    // already rolled back (e.g. by a procedure's own CATCH block)
  }
}

/**
 * Confirm / un-confirm a phiếu giám định the way the desktop app
 * (NVS_RMWAREHOUSE frmChiTietPhieu.btnXacNhan / btnHuyXacNhan) does, but with
 * every check and write in one transaction.
 */
@Injectable()
export class InspectionConfirmRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getPermissions(tkId: number): Promise<{ xacNhan: boolean; huyXacNhan: boolean }> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('TKId', sql.BigInt, tkId)
      .input('TenForm', sql.NVarChar(500), PERMISSION_FORM).query(`
        SELECT b.TenNut
        FROM dbo.Lib_TaiKhoan_ChucNangChiTiet a
        INNER JOIN dbo.SYS_ChucNangChiTiet b ON a.CId = b.CId
        WHERE a.TKId = @TKId AND b.TenForm = @TenForm
      `);
    const buttons = new Set(
      (result.recordset ?? []).map((row) => String(row.TenNut ?? '').trim()),
    );
    return {
      xacNhan: buttons.has(PERMISSION_XAC_NHAN),
      huyXacNhan: buttons.has(PERMISSION_HUY_XAC_NHAN),
    };
  }

  /** Name and login of the account, read from the DB rather than trusted from the client. */
  async getNguoiThaoTac(tkId: number): Promise<NguoiThaoTac | null> {
    const pool = await this.databaseService.getPool();
    const result = await pool.request().input('TKId', sql.BigInt, tkId).query(`
      SELECT TOP 1
        tk.TenDangNhap,
        LTRIM(RTRIM(CONCAT(nv.HoVaTenLot, N' ', nv.Ten))) AS HoTen
      FROM dbo.Lib_TaiKhoan tk
      LEFT JOIN dbo.Lib_NhanVien_TaiKhoan nvtk ON nvtk.TenDangNhap = tk.TenDangNhap
      LEFT JOIN dbo.Lib_NhanVien nv ON nv.NVId = nvtk.NVId
      WHERE tk.UId = @TKId
      ORDER BY nvtk.UEId DESC
    `);
    const row = result.recordset?.[0];
    if (!row) return null;
    return {
      tkId,
      hoTen: String(row.HoTen || row.TenDangNhap || '').trim(),
      tenDangNhap: String(row.TenDangNhap ?? '').trim(),
    };
  }

  async getPhieuInfo(pgdId: number): Promise<PhieuGiamDinhInfo | null> {
    const pool = await this.databaseService.getPool();
    const result = await this.selectPhieu(pool.request(), pgdId, false);
    return result;
  }

  private async selectPhieu(
    request: sql.Request,
    pgdId: number,
    lock: boolean,
  ): Promise<PhieuGiamDinhInfo | null> {
    const result = await request.input('PGDId', sql.BigInt, pgdId).query(`
      SELECT
        p.PGDId,
        p.MaPhieu,
        ISNULL(p.TrangThai, '') AS TrangThai,
        ISNULL(p.LoaiGiamDinh, '') AS LoaiGiamDinh,
        CASE WHEN EXISTS (
          SELECT 1 FROM dbo.WH_PhieuGiamDinhTong_ChiTiet t WHERE t.PhieuGiamDinhId = p.PGDId
        ) THEN 1 ELSE 0 END AS ThuocPhieuTong
      FROM dbo.WH_PhieuGiamDinh p ${lock ? 'WITH (UPDLOCK, HOLDLOCK)' : ''}
      WHERE p.PGDId = @PGDId
    `);
    const row = result.recordset?.[0];
    if (!row) return null;
    return {
      PGDId: Number(row.PGDId),
      MaPhieu: String(row.MaPhieu ?? ''),
      TrangThai: String(row.TrangThai ?? '').trim(),
      LoaiGiamDinh: String(row.LoaiGiamDinh ?? '').trim().toLowerCase(),
      ThuocPhieuTong: Number(row.ThuocPhieuTong) === 1,
    };
  }

  async xacNhan(
    pgdId: number,
    nguoi: NguoiThaoTac,
    xoaDongChuaGiamDinh: boolean,
  ): Promise<XacNhanResult> {
    const pool = await this.databaseService.getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const stop = async <T extends XacNhanResult>(result: T): Promise<T> => {
      await safeRollback(transaction);
      return result;
    };

    try {
      // Lock the header so two people can't confirm (and create two receipts) at once.
      const phieu = await this.selectPhieu(new sql.Request(transaction), pgdId, true);
      if (!phieu) return stop({ status: 'not_found' });
      if (phieu.ThuocPhieuTong) return stop({ status: 'thuoc_phieu_tong' });
      if (phieu.TrangThai === 'HUY' || phieu.TrangThai === 'DAXACNHAN') {
        return stop({ status: 'invalid_state', trangThai: phieu.TrangThai });
      }

      // 1. Inspected quantity must not exceed the Bravo document quantity.
      const vuot = await new sql.Request(transaction)
        .input('PGDId', sql.BigInt, pgdId)
        .execute('dbo.WH_PhieuGiamDinh_KhoaPhieu_KiemTraVuot');
      if ((vuot.recordset ?? []).length > 0) {
        return stop({ status: 'vuot_chung_tu', rows: vuot.recordset });
      }

      // 2. Fabric (NL): every inspected roll line needs a width (cm or inch).
      if (phieu.LoaiGiamDinh === 'nl') {
        const kho = await new sql.Request(transaction)
          .input('PGDId', sql.BigInt, pgdId)
          .execute('dbo.WH_ChiTietPhieuGiamDinh_KiemTraNhapKho_NL');
        if ((kho.recordset ?? []).length > 0) {
          return stop({ status: 'thieu_kho', rows: kho.recordset });
        }
      }

      // 3. Lines with no roll/tem at all were never inspected.
      const chuaGiamDinh = await new sql.Request(transaction)
        .input('PGDId', sql.BigInt, pgdId).query(`
          SELECT
            ct.CTPGDId,
            ISNULL(ct.MaNPL, '') AS MaNPL,
            ISNULL(ct.TenNPL, '') AS TenNPL,
            ISNULL(ct.Lot, '') AS Lot,
            ISNULL(ct.ChungTu, '') AS ChungTu
          FROM dbo.WH_ChiTietPhieuGiamDinh ct
          WHERE ct.PGDId = @PGDId
            AND NOT EXISTS (
              SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh_Cay c WHERE c.CTPGDId = ct.CTPGDId
            )
          ORDER BY ct.CTPGDId
        `);
      const dongChuaGiamDinh = chuaGiamDinh.recordset ?? [];

      let daXoaDong = 0;
      if (dongChuaGiamDinh.length > 0) {
        if (!xoaDongChuaGiamDinh) {
          return stop({ status: 'chua_giam_dinh', rows: dongChuaGiamDinh });
        }
        // Same rows the desktop deletes (XoaNhungDongNPL).
        const xoa = await new sql.Request(transaction)
          .input('PGDId', sql.BigInt, pgdId).query(`
            DELETE ct
            FROM dbo.WH_ChiTietPhieuGiamDinh ct
            WHERE ct.PGDId = @PGDId
              AND NOT EXISTS (
                SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh_Cay c WHERE c.CTPGDId = ct.CTPGDId
              );
          `);
        daXoaDong = xoa.rowsAffected?.[0] ?? 0;
      }

      // 4. Status change (also logs to eGMF_Log and stamps TenNguoiXacNhan/NgayXacNhan).
      const capNhat = await new sql.Request(transaction)
        .input('PGDId', sql.BigInt, pgdId)
        .input('TrangThai', sql.NVarChar(250), 'DAXACNHAN')
        .input('NoiDung', sql.NVarChar(250), `Xác nhận phiếu giám định ${phieu.MaPhieu} (WebApp)`)
        .input('NguoiThayDoi', sql.NVarChar(250), nguoi.hoTen)
        .input('TaiKhoanThayDoi', sql.NVarChar(250), nguoi.tenDangNhap)
        .input('MACAddress', sql.NVarChar(50), '')
        .input('ComputerName', sql.NVarChar(500), 'WebApp')
        .execute('dbo.wh_PhieuGiamDinh_CapNhatTrangThai');
      if (Number(capNhat.recordset?.[0]?.KetQua) !== 1) {
        throw new Error('wh_PhieuGiamDinh_CapNhatTrangThai không trả KetQua = 1');
      }

      // 5. The account that confirms becomes the phiếu's inspector (business rule
      //    for the WebApp). Done before the receipt, which copies NguoiGiamDinh.
      await new sql.Request(transaction)
        .input('PGDId', sql.BigInt, pgdId)
        .input('NguoiGiamDinh', sql.BigInt, nguoi.tkId)
        .input('TenNguoiGiamDinh', sql.NVarChar(500), nguoi.hoTen).query(`
          UPDATE dbo.WH_PhieuGiamDinh
          SET NguoiGiamDinh = @NguoiGiamDinh,
              TenNguoiGiamDinh = @TenNguoiGiamDinh
          WHERE PGDId = @PGDId;
        `);

      // 6. Warehouse receipt, as the desktop does right after confirming.
      const nhapKho = await new sql.Request(transaction)
        .input('PGDId', sql.BigInt, pgdId)
        .input('NguoiTao', sql.BigInt, nguoi.tkId)
        .input('TenNguoiTao', sql.NVarChar(250), nguoi.hoTen)
        .input('TKId', sql.BigInt, nguoi.tkId)
        .execute('dbo.wh_PhieuNhapKho_TaoMoi');
      const ketQuaNhapKho = Number(nhapKho.recordset?.[0]?.KetQua);
      if (ketQuaNhapKho !== 1 && ketQuaNhapKho !== 3) {
        throw new Error(`wh_PhieuNhapKho_TaoMoi trả KetQua = ${ketQuaNhapKho}`);
      }

      await transaction.commit();
      return {
        status: 'confirmed',
        daXoaDong,
        phieuNhapKho: ketQuaNhapKho === 3 ? 'existed' : 'created',
      };
    } catch (error) {
      await safeRollback(transaction);
      throw error;
    }
  }

  async huyXacNhan(pgdId: number, nguoi: NguoiThaoTac): Promise<HuyXacNhanResult> {
    const pool = await this.databaseService.getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const stop = async <T extends HuyXacNhanResult>(result: T): Promise<T> => {
      await safeRollback(transaction);
      return result;
    };

    try {
      const phieu = await this.selectPhieu(new sql.Request(transaction), pgdId, true);
      if (!phieu) return stop({ status: 'not_found' });
      if (phieu.ThuocPhieuTong) return stop({ status: 'thuoc_phieu_tong' });
      if (phieu.TrangThai !== 'DAXACNHAN') {
        return stop({ status: 'invalid_state', trangThai: phieu.TrangThai });
      }

      // QA already inspected fabric rolls of this phiếu.
      const kiemVai = await new sql.Request(transaction)
        .input('PGDId', sql.BigInt, pgdId).query(`
          SELECT COUNT(*) AS SoCay
          FROM dbo.QM_PhieuKiemVai_CayVai a
          INNER JOIN dbo.WH_ChiTietPhieuGiamDinh_Cay b ON a.MaCayVai = b.MaCay
          INNER JOIN dbo.WH_ChiTietPhieuGiamDinh c ON b.CTPGDId = c.CTPGDId
          WHERE c.PGDId = @PGDId
        `);
      const soCayDaKiem = Number(kiemVai.recordset?.[0]?.SoCay) || 0;
      if (soCayDaKiem > 0) return stop({ status: 'da_kiem_vai', soCay: soCayDaKiem });

      // Material of this phiếu has already left the warehouse.
      const daXuat = await new sql.Request(transaction)
        .input('PGDId', sql.BigInt, pgdId).query(`
          SELECT c.MaCay, c.SoLuongXuat
          FROM dbo.WH_ChiTietPhieuGiamDinh_Cay c
          INNER JOIN dbo.WH_ChiTietPhieuGiamDinh ct ON c.CTPGDId = ct.CTPGDId
          WHERE ct.PGDId = @PGDId AND ISNULL(c.SoLuongXuat, 0) <> 0
        `);
      if ((daXuat.recordset ?? []).length > 0) {
        return stop({ status: 'da_xuat', rows: daXuat.recordset });
      }

      const capNhat = await new sql.Request(transaction)
        .input('PGDId', sql.BigInt, pgdId)
        .input('TrangThai', sql.NVarChar(250), 'HUYXACNHAN')
        .input('NoiDung', sql.NVarChar(250), `Hủy xác nhận phiếu giám định ${phieu.MaPhieu} (WebApp)`)
        .input('NguoiThayDoi', sql.NVarChar(250), nguoi.hoTen)
        .input('TaiKhoanThayDoi', sql.NVarChar(250), nguoi.tenDangNhap)
        .input('MACAddress', sql.NVarChar(50), '')
        .input('ComputerName', sql.NVarChar(500), 'WebApp')
        .execute('dbo.wh_PhieuGiamDinh_CapNhatTrangThai');
      if (Number(capNhat.recordset?.[0]?.KetQua) !== 1) {
        throw new Error('wh_PhieuGiamDinh_CapNhatTrangThai không trả KetQua = 1');
      }

      await transaction.commit();
      return { status: 'cancelled' };
    } catch (error) {
      await safeRollback(transaction);
      throw error;
    }
  }
}
