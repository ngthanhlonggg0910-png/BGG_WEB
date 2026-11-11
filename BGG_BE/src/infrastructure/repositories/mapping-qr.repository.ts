import sql from 'mssql';
import { Injectable } from '@nestjs/common';
import { IMapingQrRepository } from '../../domain/repositories/mapping-qr.interface.repository.js';
import { DatabaseService } from '../database/database.service.js';
import {
  ScannedRolls,
  WH_ChiTietPhieuGiamDinh_PGDId,
  wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile,
  wh_DanhSachPhieuGiamDinhTheoThoiGian,
  WH_PhieuGiamDinh_GetDanhSachTrangThai,
  WH_PhieuGiamDinh_GetData_ByBarcodeKien,
} from '../../domain/entities/mapping-qr.entity.js';
import { splitScannedRoll_RequestDTO } from '../../application/dtos/mapping-qr-request.dto.js';

@Injectable()
export class MappingQrRepository implements IMapingQrRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getDanhSachTrangThaiPhieuGiamDinh(): Promise<
    WH_PhieuGiamDinh_GetDanhSachTrangThai[]
  > {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .execute('WH_PhieuGiamDinh_GetDanhSachTrangThai');
    return result.recordset;
  }

  async getDanhSachPhieuGiamDinhTheoThoiGian(
    LoaiGiamDinh: string,
    KieuThoiGian: string,
    NgayBatDau: Date,
    NgayKetThuc: Date,
    TrangThai: string,
  ): Promise<wh_DanhSachPhieuGiamDinhTheoThoiGian[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('LoaiGiamDinh', sql.NVarChar(200), LoaiGiamDinh)
      .input('KieuThoiGian', sql.NVarChar(50), KieuThoiGian)
      .input('NgayBatDau', sql.Date, NgayBatDau)
      .input('NgayKetThuc', sql.Date, NgayKetThuc)
      .input('TrangThai', sql.NVarChar(200), TrangThai)
      .execute('wh_DanhSachPhieuGiamDinhTheoThoiGian');

    return result.recordset ?? [];
  }

  async getDanhSachVatTuTheoBarcodeKien(
    Barcode: string,
  ): Promise<WH_PhieuGiamDinh_GetData_ByBarcodeKien[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('Barcode', sql.NVarChar(200), Barcode)
      .execute('WH_PhieuGiamDinh_GetData_ByBarcodeKien');
    return result.recordset;
  }

  async getChiTietPhieuGiamDinh(
    PGDId: number,
  ): Promise<WH_ChiTietPhieuGiamDinh_PGDId[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PGDId', sql.BigInt, PGDId)
      .execute('WH_ChiTietPhieuGiamDinh_PGDId');
    return result.recordset;
  }

  async saveMapping(
    CTPGDId: number,
    SL: number,
    TKId: number,
    TenNguoiTao: string,
    NguoiTao: number,
    NoiDung: string,
    NguoiThayDoi: string,
    TaiKhoanThayDoi: string,
    MACAddress: string,
    ComputerName: string,
    MaSoKien: string,
    MaKho: string,
    SoMet: number,
    SoYard: number,
    SoGross: number,
    QrTrangMapping: string,
  ): Promise<wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('CTPGDId', sql.BigInt, CTPGDId)
      .input('SL', sql.Real, SL)
      .input('TKId', sql.BigInt, TKId)
      .input('TenNguoiTao', sql.NVarChar(500), TenNguoiTao)
      .input('NguoiTao', sql.BigInt, NguoiTao)
      .input('NoiDung', sql.NVarChar(500), NoiDung)
      .input('NguoiThayDoi', sql.NVarChar(250), NguoiThayDoi)
      .input('TaiKhoanThayDoi', sql.NVarChar(250), TaiKhoanThayDoi)
      .input('MACAddress', sql.NVarChar(250), MACAddress)
      .input('ComputerName', sql.NVarChar(250), ComputerName)
      .input('MaSoKien', sql.NVarChar(250), MaSoKien)
      .input('MaKho', sql.NVarChar(250), MaKho)
      .input('SoMet', sql.Decimal(18, 4), SoMet)
      .input('SoYard', sql.Decimal(18, 4), SoYard)
      .input('SoGross', sql.Decimal(18, 4), SoGross)
      .input('QrTrangMapping', sql.NVarChar(50), QrTrangMapping)
      .execute('wh_ChiTietPhieuGiamDinhCay_ThemMoi_MappingQRTrang_Mobile');

    const row = result.recordset?.[0];

    if (!row) {
      throw new Error(`Procedure không trả kết quả cho CTPGDId ${CTPGDId}`);
    }

    return row;
  }

  async getScannedRolls(
    CTPGDId: number,
    QrTrangMapping?: string,
  ): Promise<ScannedRolls[]> {
    const pool = await this.databaseService.getPool();
    const cleanQr = QrTrangMapping ? String(QrTrangMapping).trim() : '';
    const result = await pool
      .request()
      .input('CTPGDId', sql.BigInt, CTPGDId)
      .input('QrTrangMapping', sql.NVarChar(100), cleanQr).query(`
      SELECT *
      FROM WH_ChiTietPhieuGiamDinh_Cay
      WHERE CTPGDId = @CTPGDId
        AND (@QrTrangMapping = '' OR QrTrangMapping = @QrTrangMapping)
      ORDER BY CayId ASC;
    `);

    return result.recordset;
  }

  async getMaterialsByQrTrang(Barcode: string): Promise<any[]> {
    const cleanBarcode = String(Barcode ?? '').trim();
    if (!cleanBarcode) {
      return [];
    }

    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('Barcode', sql.NVarChar(100), cleanBarcode).query(`
      DECLARE @TargetQr NVARCHAR(100) = @Barcode;

      -- Nếu người dùng quét mã tem con (PAH.../NAH...), tự động suy ra mã thùng QrTrangMapping của nó
      IF NOT EXISTS (
        SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh_Cay WHERE QrTrangMapping = @Barcode
      )
      BEGIN
        SELECT TOP 1 @TargetQr = ISNULL(NULLIF(LTRIM(RTRIM(QrTrangMapping)), ''), @Barcode)
        FROM dbo.WH_ChiTietPhieuGiamDinh_Cay
        WHERE MaCay = @Barcode;
      END

      WITH CartonPerCTPGD AS (
        SELECT
          c.CTPGDId,
          MAX(ISNULL(c.QrTrangMapping, @TargetQr)) AS QrTrangMapping,
          MAX(ISNULL(c.MaSoKien, '')) AS MaSoKien,
          ROUND(SUM(ISNULL(c.SL, 0)), 4) AS SoLuongTrongThung,
          COUNT(*) AS SoTemTrongThung
        FROM dbo.WH_ChiTietPhieuGiamDinh_Cay c
        WHERE c.QrTrangMapping = @TargetQr OR c.MaCay = @Barcode
        GROUP BY c.CTPGDId
      ),
      TotalPerCTPGD AS (
        SELECT
          c.CTPGDId,
          ROUND(SUM(ISNULL(c.SL, 0)), 4) AS TongGiamDinhPL,
          ROUND(SUM(ISNULL(c.SoMet, 0)), 4) AS TongGiamDinh,
          COUNT(*) AS TongSoCayToanPhieu
        FROM dbo.WH_ChiTietPhieuGiamDinh_Cay c
        INNER JOIN CartonPerCTPGD ct ON ct.CTPGDId = c.CTPGDId
        GROUP BY c.CTPGDId
      ),
      BarvoInfo AS (
        SELECT
          VTId,
          MAX(ArtCode) AS ArtCode,
          MAX(ProductCode) AS ProductCode
        FROM dbo.Lib_NguyenPhuLieu_Barvo
        GROUP BY VTId
      )
      SELECT
        carton.QrTrangMapping,
        carton.MaSoKien,
        carton.SoLuongTrongThung,
        carton.SoTemTrongThung,
        ISNULL(tot.TongGiamDinhPL, 0) AS TongGiamDinhPL,
        ISNULL(tot.TongGiamDinh, 0) AS TongGiamDinh,
        ISNULL(tot.TongSoCayToanPhieu, 0) AS SoLuongCay,
        b.CTPGDId,
        b.PGDId,
        pgd.MaPhieu,
        pgd.NgayGiamDinh,
        pgd.TrangThai AS TrangThaiPhieu,
        pgd.MaHang,
        pgd.LoaiGiamDinh,
        pgd.Lo AS LoPhieu,
        pgd.TenNguoiTao AS TenNguoiTaoPhieu,
        pgd.TenNguoiGiamDinh,
        a.VTId,
        a.DHId,
        a.MaChungLoai,
        a.DienGiai AS TenChungLoai,
        a.Item,
        a.MaMau AS ColorCode,
        a.ThanhPhan,
        a.KhoVatTu,
        a.Size,
        a.DVT,
        a.QuyCach,
        a.MatVatTuGhep,
        a.LoaiNPL,
        a.DienGiai,
        a.CodeMauVai,
        a.TenNguoiTao,
        c.ArtCode,
        c.ProductCode,
        b.SLKDat,
        b.SLDat,
        b.SLKiem,
        b.ChungTu,
        b.Lot,
        b.Kho,
        b.FA,
        b.PKList,
        b.Brand,
        b.ChoXuLy,
        b.HuongXuLy,
        b.LoaiTiLe,
        b.TiLe,
        b.Lo,
        b.SoPO,
        b.PONo,
        b.SoLuongChungTuThucTe
      FROM CartonPerCTPGD carton
      INNER JOIN dbo.WH_ChiTietPhieuGiamDinh b ON b.CTPGDId = carton.CTPGDId
      INNER JOIN dbo.WH_PhieuGiamDinh pgd ON pgd.PGDId = b.PGDId
      INNER JOIN dbo.Lib_NguyenPhuLieu a ON a.VTId = b.VTId
      LEFT JOIN BarvoInfo c ON c.VTId = a.VTId
      LEFT JOIN TotalPerCTPGD tot ON tot.CTPGDId = b.CTPGDId
      ORDER BY b.CTPGDId ASC;
    `);

    return result.recordset ?? [];
  }

  async updateScannedRoll(
    SL: number,
    CayId: number,
    CTPGDId: number,
  ): Promise<number> {
    const pool = await this.databaseService.getPool();

    const result = await pool
      .request()
      .input('SL', sql.Float, SL)
      .input('CayId', sql.BigInt, CayId)
      .input('CTPGDId', sql.BigInt, CTPGDId).query(`
      UPDATE c
      SET c.SL = @SL,
          c.SoMet = CASE WHEN ISNULL(p.LoaiGiamDinh, 'pl') = 'pl' OR ISNULL(c.SoMet, 0) = ISNULL(c.SL, 0) THEN @SL ELSE c.SoMet END,
          c.SoYard = CASE WHEN ISNULL(p.LoaiGiamDinh, 'pl') = 'pl' OR ISNULL(c.SoYard, 0) = ISNULL(c.SL, 0) THEN @SL ELSE c.SoYard END,
          c.SoGross = CASE WHEN ISNULL(p.LoaiGiamDinh, 'pl') = 'pl' OR ISNULL(c.SoGross, 0) = ISNULL(c.SL, 0) THEN @SL ELSE c.SoGross END
      FROM dbo.WH_ChiTietPhieuGiamDinh_Cay c
      LEFT JOIN dbo.WH_ChiTietPhieuGiamDinh ct ON ct.CTPGDId = c.CTPGDId
      LEFT JOIN dbo.WH_PhieuGiamDinh p ON p.PGDId = ct.PGDId
      WHERE c.CayId = @CayId
        AND c.CTPGDId = @CTPGDId;

      DECLARE @RowCount INT = @@ROWCOUNT;

      IF @RowCount > 0
      BEGIN
        DECLARE @SLChungTu REAL = 0, @TongSLCay REAL = 0;
        SELECT @SLChungTu = ISNULL(TRY_CAST(ChungTu AS REAL), ISNULL(TRY_CAST(PKList AS REAL), 0))
        FROM dbo.WH_ChiTietPhieuGiamDinh
        WHERE CTPGDId = @CTPGDId;

        SELECT @TongSLCay = ISNULL(SUM(ISNULL(SL, 0)), 0)
        FROM dbo.WH_ChiTietPhieuGiamDinh_Cay
        WHERE CTPGDId = @CTPGDId;

        UPDATE dbo.WH_ChiTietPhieuGiamDinh
        SET Thieu = CASE WHEN @SLChungTu - @TongSLCay > 0 THEN ROUND(@SLChungTu - @TongSLCay, 2) ELSE 0 END,
            Thua  = CASE WHEN @TongSLCay - @SLChungTu > 0 THEN ROUND(@TongSLCay - @SLChungTu, 2) ELSE 0 END
        WHERE CTPGDId = @CTPGDId;

        IF EXISTS (
          SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh
          WHERE CTPGDId = @CTPGDId AND ISNULL(LoaiTiLe, '') <> ''
        )
        BEGIN
          EXEC dbo.wh_chitietphieugiamdinh_capnhat_tilekiem @TiLe = 0, @LoaiTiLe = N'', @CTPGDId = @CTPGDId;
        END
      END

      SELECT @RowCount AS RowsUpdated;
    `);

    return result.recordset?.[0]?.RowsUpdated ?? result.rowsAffected?.[0] ?? 0;
  }

  async splitScannedRoll(
    dto: splitScannedRoll_RequestDTO,
  ): Promise<ScannedRolls[]> {
    const validQuantities = (dto.quantities || [])
      .map((q) => Number(q))
      .filter((q) => Number.isFinite(q) && q > 0);

    if (validQuantities.length < 2) {
      throw new Error('Cần ít nhất 2 phần có số lượng lớn hơn 0 để tách tem');
    }

    const pool = await this.databaseService.getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const origRes = await new sql.Request(transaction)
        .input('CayId', sql.BigInt, dto.CayId)
        .input('CTPGDId', sql.BigInt, dto.CTPGDId).query(`
          SELECT TOP 1
            c.*,
            ISNULL(p.LoaiGiamDinh, 'pl') AS LoaiGiamDinh
          FROM dbo.WH_ChiTietPhieuGiamDinh_Cay c
          LEFT JOIN dbo.WH_ChiTietPhieuGiamDinh ct ON ct.CTPGDId = c.CTPGDId
          LEFT JOIN dbo.WH_PhieuGiamDinh p ON p.PGDId = ct.PGDId
          WHERE c.CayId = @CayId AND c.CTPGDId = @CTPGDId
        `);

      const orig = origRes.recordset?.[0];
      if (!orig) {
        throw new Error('Không tìm thấy tem gốc cần tách');
      }

      const soLuongXuat = Number(orig.SoLuongXuat || 0);
      if (soLuongXuat > 0 && validQuantities[0] < soLuongXuat) {
        throw new Error(
          `Tem gốc đã xuất kho ${soLuongXuat}, số lượng phần đầu tiên không được nhỏ hơn số lượng đã xuất`,
        );
      }

      const isNL = String(orig.LoaiGiamDinh || 'pl').toLowerCase() === 'nl';
      const firstQty = validQuantities[0];

      // 1. Update original roll with the first split quantity
      await new sql.Request(transaction)
        .input('CayId', sql.BigInt, dto.CayId)
        .input('CTPGDId', sql.BigInt, dto.CTPGDId)
        .input('SL', sql.Float, firstQty).query(`
          UPDATE dbo.WH_ChiTietPhieuGiamDinh_Cay
          SET SL = @SL,
              SoMet = CASE WHEN ${isNL ? 0 : 1} = 1 OR ISNULL(SoMet, 0) = ISNULL(SL, 0) THEN @SL ELSE SoMet END,
              SoYard = CASE WHEN ${isNL ? 0 : 1} = 1 OR ISNULL(SoYard, 0) = ISNULL(SL, 0) THEN @SL ELSE SoYard END,
              SoGross = CASE WHEN ${isNL ? 0 : 1} = 1 OR ISNULL(SoGross, 0) = ISNULL(SL, 0) THEN @SL ELSE SoGross END
          WHERE CayId = @CayId AND CTPGDId = @CTPGDId
        `);

      const tkId = dto.TKId ?? orig.TKId ?? null;
      const tenNguoiTao = dto.TenNguoiTao || orig.TenNguoiTao || '';
      const nguoiTao = dto.NguoiTao ?? orig.NguoiTao ?? null;
      const maCayGoc =
        orig.MaCayMappingGoc && String(orig.MaCayMappingGoc).trim()
          ? String(orig.MaCayMappingGoc).trim()
          : String(orig.MaCay || '').trim();

      // 2. Insert each additional split roll with a newly generated MaCay
      for (let i = 1; i < validQuantities.length; i++) {
        const qty = validQuantities[i];
        const spName = isNL
          ? 'dbo.SP_TaoMaCayMoi_GiamDinh'
          : 'dbo.SP_TaoMaCayMoi_GiamDinh_PL';

        const codeRes = await new sql.Request(transaction)
          .output('MaCayMoi', sql.VarChar(20))
          .execute(spName);

        const maCayMoi = codeRes.output?.MaCayMoi;
        if (!maCayMoi) {
          throw new Error('Không thể sinh mã tem mới từ hệ thống');
        }

        await new sql.Request(transaction)
          .input('CTPGDId', sql.BigInt, dto.CTPGDId)
          .input('MaCay', sql.NVarChar(50), maCayMoi)
          .input('SL', sql.Real, qty)
          .input('TKId', sql.BigInt, tkId)
          .input('TenNguoiTao', sql.NVarChar(500), tenNguoiTao)
          .input('NguoiTao', sql.BigInt, nguoiTao)
          .input('MaSoKien', sql.NVarChar(250), orig.MaSoKien ?? '')
          .input('SoYard', sql.Decimal(18, 4), qty)
          .input('SoMet', sql.Decimal(18, 4), qty)
          .input('SoGross', sql.Decimal(18, 4), qty)
          .input('DocDate', sql.Date, orig.DocDate ?? new Date())
          .input('MaKho', sql.NVarChar(250), orig.MaKho ?? null)
          .input('QrTrangMapping', sql.NVarChar(50), orig.QrTrangMapping ?? null)
          .input(
            'NguoiMapping',
            sql.NVarChar(250),
            tenNguoiTao || orig.NguoiMapping || null,
          )
          .input('MaCayCu', sql.NVarChar(50), orig.MaCay ?? null)
          .input('MaCayMappingGoc', sql.NVarChar(50), maCayGoc || null)
          .input('MaRo', sql.NVarChar(50), orig.MaRo ?? null)
          .input('DuocCap', sql.Bit, orig.DuocCap ?? null)
          .input('MaHangPO', sql.NVarChar(250), orig.MaHangPO ?? null)
          .input('SoToKhai', sql.NVarChar(250), orig.SoToKhai ?? null)
          .input('NgayToKhai', sql.Date, orig.NgayToKhai ?? null)
          .input('KetQuaKiem', sql.Bit, orig.KetQuaKiem ?? null)
          .input('HuongXuLyCay', sql.NVarChar(250), orig.HuongXuLyCay ?? null)
          .query(`
            INSERT INTO dbo.WH_ChiTietPhieuGiamDinh_Cay (
              CTPGDId,
              MaCay,
              SL,
              TKId,
              TenNguoiTao,
              NgayTao,
              NguoiTao,
              MaSoKien,
              SoLuongXuat,
              SoYard,
              SoMet,
              SoGross,
              DocDate,
              MaKho,
              QrTrangMapping,
              NguoiMapping,
              TGMapping,
              MaCayCu,
              MaCayMappingGoc,
              MaRo,
              DuocCap,
              MaHangPO,
              SoToKhai,
              NgayToKhai,
              KetQuaKiem,
              HuongXuLyCay
            )
            VALUES (
              @CTPGDId,
              @MaCay,
              @SL,
              @TKId,
              @TenNguoiTao,
              GETDATE(),
              @NguoiTao,
              @MaSoKien,
              0,
              @SoYard,
              @SoMet,
              @SoGross,
              @DocDate,
              @MaKho,
              @QrTrangMapping,
              @NguoiMapping,
              GETDATE(),
              @MaCayCu,
              @MaCayMappingGoc,
              @MaRo,
              @DuocCap,
              @MaHangPO,
              @SoToKhai,
              @NgayToKhai,
              @KetQuaKiem,
              @HuongXuLyCay
            )
          `);
      }

      // 3. Recalculate Thieu / Thua (and AQL SLKiem if already selected) on WH_ChiTietPhieuGiamDinh and return all rolls
      const finalRes = await new sql.Request(transaction).input(
        'CTPGDId',
        sql.BigInt,
        dto.CTPGDId,
      ).query(`
        DECLARE @SLChungTu REAL = 0, @TongSLCay REAL = 0;
        SELECT @SLChungTu = ISNULL(TRY_CAST(ChungTu AS REAL), ISNULL(TRY_CAST(PKList AS REAL), 0))
        FROM dbo.WH_ChiTietPhieuGiamDinh
        WHERE CTPGDId = @CTPGDId;

        SELECT @TongSLCay = ISNULL(SUM(ISNULL(SL, 0)), 0)
        FROM dbo.WH_ChiTietPhieuGiamDinh_Cay
        WHERE CTPGDId = @CTPGDId;

        UPDATE dbo.WH_ChiTietPhieuGiamDinh
        SET Thieu = CASE WHEN @SLChungTu - @TongSLCay > 0 THEN ROUND(@SLChungTu - @TongSLCay, 2) ELSE 0 END,
            Thua  = CASE WHEN @TongSLCay - @SLChungTu > 0 THEN ROUND(@TongSLCay - @SLChungTu, 2) ELSE 0 END
        WHERE CTPGDId = @CTPGDId;

        IF EXISTS (
          SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh
          WHERE CTPGDId = @CTPGDId AND ISNULL(LoaiTiLe, '') <> ''
        )
        BEGIN
          EXEC dbo.wh_chitietphieugiamdinh_capnhat_tilekiem @TiLe = 0, @LoaiTiLe = N'', @CTPGDId = @CTPGDId;
        END

        SELECT *
        FROM dbo.WH_ChiTietPhieuGiamDinh_Cay
        WHERE CTPGDId = @CTPGDId
        ORDER BY CayId ASC;
      `);

      await transaction.commit();
      return finalRes.recordset ?? [];
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteScannedRoll(MaCay: string): Promise<number> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('MaCay', sql.NVarChar(200), MaCay)
      .query(`
        DECLARE @CTPGDId BIGINT;
        SELECT TOP 1 @CTPGDId = CTPGDId
        FROM dbo.WH_ChiTietPhieuGiamDinh_Cay
        WHERE MaCay = @MaCay;

        DELETE FROM dbo.WH_ChiTietPhieuGiamDinh_Cay
        WHERE MaCay = @MaCay;

        DECLARE @RowCount INT = @@ROWCOUNT;

        IF @RowCount > 0 AND @CTPGDId IS NOT NULL
        BEGIN
          DECLARE @SLChungTu REAL = 0, @TongSLCay REAL = 0;
          SELECT @SLChungTu = ISNULL(TRY_CAST(ChungTu AS REAL), ISNULL(TRY_CAST(PKList AS REAL), 0))
          FROM dbo.WH_ChiTietPhieuGiamDinh
          WHERE CTPGDId = @CTPGDId;

          SELECT @TongSLCay = ISNULL(SUM(ISNULL(SL, 0)), 0)
          FROM dbo.WH_ChiTietPhieuGiamDinh_Cay
          WHERE CTPGDId = @CTPGDId;

          UPDATE dbo.WH_ChiTietPhieuGiamDinh
          SET Thieu = CASE WHEN @SLChungTu - @TongSLCay > 0 THEN ROUND(@SLChungTu - @TongSLCay, 2) ELSE 0 END,
              Thua  = CASE WHEN @TongSLCay - @SLChungTu > 0 THEN ROUND(@TongSLCay - @SLChungTu, 2) ELSE 0 END
          WHERE CTPGDId = @CTPGDId;

          IF EXISTS (
            SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh
            WHERE CTPGDId = @CTPGDId AND ISNULL(LoaiTiLe, '') <> ''
          )
          BEGIN
            EXEC dbo.wh_chitietphieugiamdinh_capnhat_tilekiem @TiLe = 0, @LoaiTiLe = N'', @CTPGDId = @CTPGDId;
          END
        END

        SELECT @RowCount AS RowsDeleted;
      `);

    return result.recordset?.[0]?.RowsDeleted ?? result.rowsAffected?.[0] ?? 0;
  }
}
