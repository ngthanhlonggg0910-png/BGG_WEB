import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android,
  wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId,
  wh_DanhSachPhieuSoanHangNgayVaTinhTrang,
  wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang,
} from '../../domain/entities/picking-order.entity.js';
import { IPickingOrderRepository } from '../../domain/repositories/picking-order.repository.interface.js';
import { DatabaseService } from '../database/database.service.js';
import {
  DotXuatItemDTO,
  TienDoSoanHangData,
  XacNhanXuatKhoData,
} from '../../application/dtos/picking-order-response.dto.js';
import { wh_XacNhanXuatKho_RequestDTO } from '../../application/dtos/picking-order-request.dto.js';
import sql from 'mssql';

@Injectable()
export class PickingOrderRepository implements IPickingOrderRepository {
  constructor(public readonly databaseService: DatabaseService) {}

  async getDanhSachPhieuSoanHangTheoNgayVaTinhTrang(
    maKho: string,
    tkId: number,
    ngaySoan: Date,
    tinhTrang: string,
  ): Promise<wh_DanhSachPhieuSoanHangNgayVaTinhTrang[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('maKho', sql.NVarChar(50), maKho)
      .input('tkId', sql.BigInt, tkId)
      .input('ngaySoan', sql.DateTime, ngaySoan)
      .input('tinhTrang', sql.NVarChar(50), tinhTrang)
      .execute('wh_DanhSachPhieuSoanHangNgayVaTinhTrang');

    const baseRecords: wh_DanhSachPhieuSoanHangNgayVaTinhTrang[] =
      result.recordset || [];

    // Bá»• sung cÃ¡c Phiáº¿u soáº¡n hÃ ng sinh tá»« ÄÆ¡n Ä‘áº·t hÃ ng LSX (LoaiLenh = 'DonDatHang')
    try {
      const lsxResult = await pool
        .request()
        .input('maKho', sql.NVarChar(50), (maKho || '').trim().toUpperCase())
        .input('ngaySoan', sql.DateTime, ngaySoan)
        .input('tinhTrang', sql.NVarChar(50), tinhTrang)
        .query(`
          SELECT 
            d.DonDatHangId AS DDHId,
            psh.MaSoPhieuSoan,
            psh.NgaySoan,
            psh.NgayTao,
            psh.NguoiTao,
            psh.PhieuSoanHangId,
            psh.TenNguoiTao,
            psh.TinhTrang,
            psh.TKId,
            d.SoDonDatHang AS DDH,
            ISNULL(d.NguoiDat, N'') + CASE WHEN ISNULL(d.GhiChu, N'') <> N'' THEN CHAR(10) + CHAR(10) + N'GHI CHÃš: ' + d.GhiChu + CHAR(10) ELSE N'' END AS NguoiDat,
            lsx.SoLSX AS PO,
            d.NgayCanGiao AS NgayGiaoHang,
            lsx.MaHang,
            CASE 
              WHEN d.LoaiDatHang = N'NguyenLieu' THEN N'NhÃ  cáº¯t ' + ISNULL(lsx.NhaCat, N'')
              ELSE N'Tá»• may ' + ISNULL(lsx.ToMay, N'')
            END AS CapCho
          FROM dbo.WH_PhieuSoanHang psh
          INNER JOIN dbo.OMM_DonDatHang_LSX d ON psh.LenhId = d.DonDatHangId
          INNER JOIN dbo.OMM_LenhSanXuat lsx ON d.LSXId = lsx.LSXId
          WHERE psh.LoaiLenh = N'DonDatHang'
            AND DATEDIFF(DAY, psh.NgaySoan, @ngaySoan) = 0
            AND (
              (@tinhTrang = N'hoanthanh' AND psh.TinhTrang = N'hoanthanh')
              OR (@tinhTrang <> N'hoanthanh' AND ISNULL(psh.TinhTrang, N'') NOT IN (N'hoanthanh', N'huy'))
            )
            AND (
              (@maKho = N'NA' AND (d.LoaiDatHang = N'NguyenLieu' OR psh.MaSoPhieuSoan LIKE N'NA%'))
              OR (@maKho = N'PA' AND (d.LoaiDatHang = N'PhuLieu' OR psh.MaSoPhieuSoan LIKE N'PA%' OR psh.MaSoPhieuSoan LIKE N'PL%'))
              OR psh.MaSoPhieuSoan LIKE @maKho + N'%'
            )
        `);

      const existingIds = new Set(baseRecords.map((r) => r.PhieuSoanHangId));
      for (const row of lsxResult.recordset || []) {
        if (!existingIds.has(row.PhieuSoanHangId)) {
          baseRecords.push(row);
        }
      }
    } catch (err) {
      console.error('Lá»—i truy váº¥n bá»• sung phiáº¿u soáº¡n LSX:', err);
    }

    return baseRecords;
  }

  async getDanhSachChiTietPhieuSoanHangTheoPhieuSoanHangId(
    PhieuSoanHangId: number,
  ): Promise<wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuSoanHangId', sql.BigInt, PhieuSoanHangId)
      .execute('wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId');
    return result.recordset;
  }

  async getDanhSachVatTuTheoMaRoVaPhieuSoanHang(
    PhieuSoanHangId: number,
    SoRo: string,
  ): Promise<wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuSoanHangId', sql.BigInt, PhieuSoanHangId)
      .input('SoRo', sql.NVarChar(200), SoRo)
      .execute('wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang');
    return result.recordset;
  }

  async getDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang(
    PhieuSoanHangId: number,
    SoRo: string,
    MaCay: string,
  ): Promise<wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuSoanHangId', sql.BigInt, PhieuSoanHangId)
      .input('SoRo', sql.NVarChar(150), SoRo)
      .input('MaCay', sql.NVarChar(150), MaCay)
      .execute('wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang');

    return result.recordset ?? [];
  }

  async wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android(
    PhieuSoanHangId: number,
    MaCay: string,
    SoLuongThucSoan: number,
    TKQuet: number,
    TenNguoiQuyetXuat: string,
  ): Promise<wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android[]> {
    const pool = await this.databaseService.getPool();
    const result = await pool
      .request()
      .input('PhieuSoanHangId', sql.BigInt, PhieuSoanHangId)
      .input('MaCay', sql.NVarChar(100), MaCay)
      .input('SoLuongThucSoan', sql.Real, SoLuongThucSoan)
      .input('TKQuet', sql.BigInt, TKQuet)
      .input('TenNguoiQuyetXuat', sql.NVarChar(200), TenNguoiQuyetXuat)
      .execute('wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Web');

    return result.recordset;
  }

  // 1. Kiá»ƒm tra tiáº¿n Ä‘á»™ soáº¡n hÃ ng vÃ  lá»‹ch sá»­ Ä‘á»£t xuáº¥t
  async getTienDoSoanHang(phieuSoanHangId: number): Promise<TienDoSoanHangData> {
    const pool = await this.databaseService.getPool();

    // Láº¥y thÃ´ng tin header phiáº¿u
    const headerResult = await pool
      .request()
      .input('id', sql.BigInt, phieuSoanHangId)
      .query(`
        SELECT PhieuSoanHangId, MaSoPhieuSoan, TinhTrang, LoaiLenh, LenhId
        FROM dbo.WH_PhieuSoanHang
        WHERE PhieuSoanHangId = @id
      `);

    if (!headerResult.recordset || headerResult.recordset.length === 0) {
      throw new NotFoundException(`KhÃ´ng tÃ¬m tháº¥y phiáº¿u soáº¡n hÃ ng vá»›i ID: ${phieuSoanHangId}`);
    }

    const header = headerResult.recordset[0];

    // Láº¥y danh sÃ¡ch chi tiáº¿t vÃ  tá»•ng sá»‘ lÆ°á»£ng Ä‘Ã£ quÃ©t
    const detailResult = await pool
      .request()
      .input('id', sql.BigInt, phieuSoanHangId)
      .query(`
        SELECT 
          s.ChiTietPhieuSoanHangId,
          ISNULL(s.SoLuongYeuCau, 0) AS SoLuongYeuCau,
          ISNULL(s.SoLuongThucSoan, 0) AS SoLuongThucSoan,
          ISNULL(issued.Quantity, 0) AS SoLuongDaQuetCay,
          ISNULL(issued.SoCay, 0) AS SoCay
        FROM dbo.WH_ChiTietPhieuSoanHang s
        OUTER APPLY (
          SELECT 
            SUM(CONVERT(decimal(18,4), ISNULL(x.SoLuong, 0))) AS Quantity,
            COUNT(1) AS SoCay
          FROM dbo.WH_ChiTietPhieuSoanHang_ChiTietCay x
          WHERE x.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
        ) issued
        WHERE s.PhieuSoanHangId = @id
      `);

    const details = detailResult.recordset || [];
    const tongMatHang = details.length;
    let matHangDaDu = 0;
    let tongSoLuongYeuCau = 0;
    let tongSoLuongThucSoan = 0;
    let tongSoCayDaQuet = 0;

    for (const r of details) {
      const ycau = Number(r.SoLuongYeuCau) || 0;
      // Láº¥y sá»‘ lÆ°á»£ng tá»« cÃ¢y Ä‘Ã£ quÃ©t (náº¿u cÃ³) hoáº·c SoLuongThucSoan
      const thuc = Math.max(Number(r.SoLuongDaQuetCay) || 0, Number(r.SoLuongThucSoan) || 0);
      tongSoLuongYeuCau += ycau;
      tongSoLuongThucSoan += thuc;
      tongSoCayDaQuet += Number(r.SoCay) || 0;

      if (thuc >= ycau && ycau > 0) {
        matHangDaDu++;
      }
    }

    let phanTramTienDo =
      tongSoLuongYeuCau > 0
        ? Math.min(100, Math.round((tongSoLuongThucSoan / tongSoLuongYeuCau) * 1000) / 10)
        : 0;
    const isDu100 = tongMatHang > 0 && matHangDaDu >= tongMatHang && phanTramTienDo >= 99.9;

    // Láº¥y sá»‘ cÃ¢y vÃ  sá»‘ lÆ°á»£ng chÆ°a chá»‘t Ä‘á»£t xuáº¥t
    const rollDiffResult = await pool
      .request()
      .input('id', sql.BigInt, phieuSoanHangId)
      .query(`
        WITH Scanned AS (
          SELECT 
            s.ChiTietPhieuSoanHangId, x.CayId, x.MaCay,
            SUM(CONVERT(decimal(18,4), ISNULL(x.SoLuong, 0))) AS SoLuong
          FROM dbo.WH_ChiTietPhieuSoanHang s
          JOIN dbo.WH_ChiTietPhieuSoanHang_ChiTietCay x ON x.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
          WHERE s.PhieuSoanHangId = @id
          GROUP BY s.ChiTietPhieuSoanHangId, x.CayId, x.MaCay
        ),
        Issued AS (
          SELECT 
            d.ChiTietPhieuSoanHangId, d.CayId, d.MaCay,
            SUM(d.SoLuong) AS SoLuong
          FROM dbo.WH_PhieuSoanHang_DotXuat h 
          JOIN dbo.WH_PhieuSoanHang_DotXuat_Cay d ON d.DotXuatId = h.DotXuatId
          WHERE h.PhieuSoanHangId = @id 
          GROUP BY d.ChiTietPhieuSoanHangId, d.CayId, d.MaCay
        )
        SELECT 
          COUNT(sc.MaCay) AS SoCayChuaChot,
          ISNULL(SUM(sc.SoLuong - ISNULL(iss.SoLuong, 0)), 0) AS SoLuongChuaChot
        FROM Scanned sc
        LEFT JOIN Issued iss ON iss.ChiTietPhieuSoanHangId = sc.ChiTietPhieuSoanHangId 
          AND iss.CayId = sc.CayId 
          AND iss.MaCay = sc.MaCay
        WHERE (sc.SoLuong - ISNULL(iss.SoLuong, 0)) > 0
      `);

    const diff = rollDiffResult.recordset?.[0] || { SoCayChuaChot: 0, SoLuongChuaChot: 0 };
    const soCayChuaChotDot = Number(diff.SoCayChuaChot) || 0;
    const soLuongChuaChotDot = Number(diff.SoLuongChuaChot) || 0;

    // Láº¥y lá»‹ch sá»­ cÃ¡c Ä‘á»£t xuáº¥t
    const batchListResult = await pool
      .request()
      .input('id', sql.BigInt, phieuSoanHangId)
      .query(`
        SELECT 
          h.DotXuatId,
          h.SoDot,
          h.SoPhieu,
          h.NgayXuat,
          h.NguoiXuat,
          COUNT(d.Id) AS SoCay,
          ISNULL(SUM(d.SoLuong), 0) AS TongSoLuong
        FROM dbo.WH_PhieuSoanHang_DotXuat h
        LEFT JOIN dbo.WH_PhieuSoanHang_DotXuat_Cay d ON d.DotXuatId = h.DotXuatId
        WHERE h.PhieuSoanHangId = @id
        GROUP BY h.DotXuatId, h.SoDot, h.SoPhieu, h.NgayXuat, h.NguoiXuat
        ORDER BY h.SoDot DESC
      `);

    const danhSachDotXuat: DotXuatItemDTO[] = (batchListResult.recordset || []).map((row) => ({
      dotXuatId: Number(row.DotXuatId),
      soDot: Number(row.SoDot),
      soPhieu: row.SoPhieu,
      ngayXuat: row.NgayXuat,
      nguoiXuat: row.NguoiXuat,
      soCay: Number(row.SoCay),
      tongSoLuong: Number(row.TongSoLuong),
    }));

    return {
      phieuSoanHangId: Number(header.PhieuSoanHangId),
      maSoPhieuSoan: header.MaSoPhieuSoan,
      tinhTrang: header.TinhTrang,
      loaiLenh: header.LoaiLenh,
      lenhId: Number(header.LenhId) || 0,
      tongMatHang,
      matHangDaDu,
      tongSoLuongYeuCau,
      tongSoLuongThucSoan,
      phanTramTienDo,
      isDu100,
      tongSoCayDaQuet,
      soCayChuaChotDot,
      soLuongChuaChotDot,
      soDotXuat: danhSachDotXuat.length,
      danhSachDotXuat,
    };
  }

  // 2. XÃ¡c nháº­n xuáº¥t kho (xuáº¥t Ä‘á»£t hoáº·c hoÃ n táº¥t xuáº¥t kho)
  async xacNhanXuatKho(dto: wh_XacNhanXuatKho_RequestDTO): Promise<XacNhanXuatKhoData> {
    const pool = await this.databaseService.getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      // 1. Kiá»ƒm tra tráº¡ng thÃ¡i phiáº¿u
      const headerReq = new sql.Request(transaction);
      headerReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
      const headerResult = await headerReq.query(`
        SELECT PhieuSoanHangId, MaSoPhieuSoan, TinhTrang, LoaiLenh, LenhId
        FROM dbo.WH_PhieuSoanHang WITH(UPDLOCK, HOLDLOCK)
        WHERE PhieuSoanHangId = @id
      `);

      if (!headerResult.recordset || headerResult.recordset.length === 0) {
        throw new NotFoundException(`Phiáº¿u soáº¡n hÃ ng [${dto.PhieuSoanHangId}] khÃ´ng tá»“n táº¡i.`);
      }

      const header = headerResult.recordset[0];
      const tinhTrangHienTai = String(header.TinhTrang || '').toLowerCase();

      if (tinhTrangHienTai === 'huy') {
        throw new BadRequestException(`Phiáº¿u soáº¡n hÃ ng [${header.MaSoPhieuSoan}] Ä‘Ã£ bá»‹ há»§y, khÃ´ng thá»ƒ xuáº¥t kho.`);
      }

      if (tinhTrangHienTai === 'hoanthanh') {
        throw new BadRequestException(`Phiáº¿u soáº¡n hÃ ng [${header.MaSoPhieuSoan}] Ä‘Ã£ hoÃ n thÃ nh trÆ°á»›c Ä‘Ã³.`);
      }

      // 2. Láº¥y danh sÃ¡ch cÃ¢y Ä‘Ã£ quÃ©t
      const scannedReq = new sql.Request(transaction);
      scannedReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
      const scannedResult = await scannedReq.query(`
        SELECT 
          s.ChiTietPhieuSoanHangId,
          x.CayId,
          x.MaCay,
          MAX(ISNULL(s.MatVatTuGhep, s.Item)) AS MaVatTu,
          MAX(s.DienGiai) AS TenVatTu,
          MAX(s.MaMau) AS Mau,
          MAX(s.QuyCach) AS QuyCach,
          MAX(g.Lot) AS Lot,
          MAX(s.DVT) AS DVT,
          SUM(CONVERT(decimal(18,4), ISNULL(x.SoLuong, 0))) AS SoLuong,
          MAX(x.ThoiGianQuetXuat) AS NgayQuetXuat
        FROM dbo.WH_ChiTietPhieuSoanHang s
        JOIN dbo.WH_ChiTietPhieuSoanHang_ChiTietCay x WITH(UPDLOCK, HOLDLOCK) ON x.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
        LEFT JOIN dbo.WH_ChiTietPhieuGiamDinh_Cay r ON r.CayId = x.CayId
        LEFT JOIN dbo.WH_ChiTietPhieuGiamDinh g ON g.CTPGDId = r.CTPGDId
        WHERE s.PhieuSoanHangId = @id
        GROUP BY s.ChiTietPhieuSoanHangId, x.CayId, x.MaCay
      `);

      const scannedRows = scannedResult.recordset || [];

      // 3. Láº¥y danh sÃ¡ch cÃ¢y Ä‘Ã£ lÆ°u trong cÃ¡c Ä‘á»£t trÆ°á»›c
      const savedReq = new sql.Request(transaction);
      savedReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
      const savedResult = await savedReq.query(`
        SELECT 
          d.ChiTietPhieuSoanHangId,
          d.CayId,
          d.MaCay,
          SUM(d.SoLuong) AS SoLuong
        FROM dbo.WH_PhieuSoanHang_DotXuat h 
        JOIN dbo.WH_PhieuSoanHang_DotXuat_Cay d ON d.DotXuatId = h.DotXuatId
        WHERE h.PhieuSoanHangId = @id 
        GROUP BY d.ChiTietPhieuSoanHangId, d.CayId, d.MaCay
      `);

      const savedMap = new Map<string, number>();
      for (const row of savedResult.recordset || []) {
        const key = `${row.ChiTietPhieuSoanHangId}_${row.CayId}_${row.MaCay}`;
        savedMap.set(key, Number(row.SoLuong) || 0);
      }

      // 4. TÃ­nh toÃ¡n delta (cÃ¡c cÃ¢y / lÆ°á»£ng xuáº¥t má»›i chÆ°a chá»‘t Ä‘á»£t)
      const newItemsToBatch: Array<{
        ChiTietPhieuSoanHangId: number;
        CayId: number;
        MaCay: string;
        MaVatTu: string;
        TenVatTu: string;
        Mau: string;
        QuyCach: string;
        Lot: string;
        DVT: string;
        SoLuong: number;
        NgayQuetXuat: Date;
      }> = [];

      for (const row of scannedRows) {
        const key = `${row.ChiTietPhieuSoanHangId}_${row.CayId}_${row.MaCay}`;
        const previousQty = savedMap.get(key) || 0;
        const currentQty = Number(row.SoLuong) || 0;

        if (currentQty < previousQty) {
          throw new BadRequestException(
            `LÆ°á»£ng xuáº¥t cá»§a cÃ¢y [${row.MaCay}] Ä‘Ã£ giáº£m so vá»›i Ä‘á»£t Ä‘Ã£ chá»‘t (${currentQty} < ${previousQty}). Cáº§n Ä‘á»‘i chiáº¿u trÆ°á»›c khi láº­p Ä‘á»£t má»›i.`,
          );
        }

        const deltaQty = currentQty - previousQty;
        if (deltaQty > 0) {
          newItemsToBatch.push({
            ChiTietPhieuSoanHangId: Number(row.ChiTietPhieuSoanHangId),
            CayId: Number(row.CayId) || 0,
            MaCay: row.MaCay,
            MaVatTu: row.MaVatTu,
            TenVatTu: row.TenVatTu,
            Mau: row.Mau,
            QuyCach: row.QuyCach,
            Lot: row.Lot,
            DVT: row.DVT,
            SoLuong: deltaQty,
            NgayQuetXuat: row.NgayQuetXuat || new Date(),
          });
        }
      }

      let batchId = 0;
      let soDot = 0;

      // 5. Náº¿u cÃ³ cÃ¢y má»›i, táº¡o Ä‘á»£t xuáº¥t má»›i
      if (newItemsToBatch.length > 0) {
        const batchHeaderReq = new sql.Request(transaction);
        batchHeaderReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
        batchHeaderReq.input('number', sql.NVarChar(100), header.MaSoPhieuSoan);
        batchHeaderReq.input('type', sql.NVarChar(50), header.LoaiLenh);
        batchHeaderReq.input('account', sql.BigInt, dto.tkId);
        batchHeaderReq.input('name', sql.NVarChar(200), dto.tenNguoiXacNhan);

        const batchInsertResult = await batchHeaderReq.query(`
          INSERT INTO dbo.WH_PhieuSoanHang_DotXuat (PhieuSoanHangId, SoDot, SoPhieu, LoaiLenh, TKId, NguoiXuat, NgayXuat)
          OUTPUT inserted.DotXuatId, inserted.SoDot
          SELECT @id, ISNULL(MAX(SoDot), 0) + 1, @number, @type, @account, @name, GETDATE()
          FROM dbo.WH_PhieuSoanHang_DotXuat WHERE PhieuSoanHangId = @id
        `);

        if (batchInsertResult.recordset && batchInsertResult.recordset.length > 0) {
          batchId = Number(batchInsertResult.recordset[0].DotXuatId);
          soDot = Number(batchInsertResult.recordset[0].SoDot);
        }

        // ChÃ¨n tá»«ng cÃ¢y má»›i vÃ o WH_PhieuSoanHang_DotXuat_Cay
        for (const item of newItemsToBatch) {
          const itemReq = new sql.Request(transaction);
          itemReq.input('batch', sql.BigInt, batchId);
          itemReq.input('detail', sql.BigInt, item.ChiTietPhieuSoanHangId);
          itemReq.input('roll', sql.BigInt, item.CayId);
          itemReq.input('barcode', sql.NVarChar(100), item.MaCay);
          itemReq.input('material', sql.NVarChar(100), item.MaVatTu || '');
          itemReq.input('description', sql.NVarChar(500), item.TenVatTu || '');
          itemReq.input('color', sql.NVarChar(100), item.Mau || '');
          itemReq.input('size', sql.NVarChar(100), item.QuyCach || '');
          itemReq.input('lot', sql.NVarChar(100), item.Lot || '');
          itemReq.input('unit', sql.NVarChar(50), item.DVT || '');
          itemReq.input('quantity', sql.Decimal(18, 4), item.SoLuong);
          itemReq.input('scanTime', sql.DateTime, item.NgayQuetXuat);

          await itemReq.query(`
            INSERT INTO dbo.WH_PhieuSoanHang_DotXuat_Cay
            (DotXuatId, ChiTietPhieuSoanHangId, CayId, MaCay, MaVatTu, TenVatTu, Mau, QuyCach, Lot, DVT, SoLuong, NgayQuetXuat)
            VALUES (@batch, @detail, @roll, @barcode, @material, @description, @color, @size, @lot, @unit, @quantity, @scanTime)
          `);
        }
      } else {
        // KhÃ´ng cÃ³ cÃ¢y má»›i, tÃ¬m Ä‘á»£t xuáº¥t gáº§n nháº¥t
        const lastBatchReq = new sql.Request(transaction);
        lastBatchReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
        const lastBatchResult = await lastBatchReq.query(`
          SELECT ISNULL(MAX(DotXuatId), 0) AS DotXuatId, ISNULL(MAX(SoDot), 0) AS SoDot
          FROM dbo.WH_PhieuSoanHang_DotXuat WHERE PhieuSoanHangId = @id
        `);

        batchId = Number(lastBatchResult.recordset?.[0]?.DotXuatId) || 0;
        soDot = Number(lastBatchResult.recordset?.[0]?.SoDot) || 0;

        if (batchId === 0 && scannedRows.length === 0) {
          throw new BadRequestException('ChÆ°a cÃ³ cÃ¢y nÃ o Ä‘Æ°á»£c ghi nháº­n quÃ©t xuáº¥t. Vui lÃ²ng quÃ©t váº­t tÆ° trÆ°á»›c!');
        }
      }

      // 6. Cáº­p nháº­t tráº¡ng thÃ¡i phiáº¿u vÃ  ÄÆ¡n Ä‘áº·t hÃ ng LSX
      let tinhTrangMoi = 'dangthuchien';

      if (dto.xacNhanHoanTat) {
        // Kiá»ƒm tra xem cÃ²n váº­t tÆ° chÆ°a xuáº¥t Ä‘á»§ khÃ´ng
        const checkShortageReq = new sql.Request(transaction);
        checkShortageReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
        const shortageResult = await checkShortageReq.query(`
          SELECT s.ChiTietPhieuSoanHangId 
          FROM dbo.WH_ChiTietPhieuSoanHang s
          OUTER APPLY(
            SELECT SUM(ISNULL(x.SoLuong,0)) AS Quantity 
            FROM dbo.WH_ChiTietPhieuSoanHang_ChiTietCay x
            WHERE x.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
          ) issued
          WHERE s.PhieuSoanHangId = @id 
            AND ISNULL(issued.Quantity, 0) < ISNULL(s.SoLuongYeuCau, 0)
        `);

        const isStillShort = (shortageResult.recordset || []).length > 0;

        if (isStillShort && !dto.choPhepDongKhiThieu) {
          throw new BadRequestException(
            'CÃ²n váº­t tÆ° chÆ°a xuáº¥t Ä‘á»§. Vui lÃ²ng chá»n "XÃ¡c nháº­n xuáº¥t Ä‘á»£t nÃ y (xuáº¥t thiáº¿u)" hoáº·c báº­t tuá»³ chá»n cho phÃ©p chá»‘t Ä‘Ã³ng Ä‘Æ¡n khi cÃ²n thiáº¿u!',
          );
        }

        // HoÃ n táº¥t phiáº¿u soáº¡n hÃ ng: gá»i Stored Procedure chÃ­nh thá»©c cá»§a há»‡ thá»‘ng
        const completeProcReq = new sql.Request(transaction);
        completeProcReq.input('PhieuSoanHangId', sql.BigInt, dto.PhieuSoanHangId);
        completeProcReq.input('NguoiXacNhan', sql.BigInt, dto.tkId);
        completeProcReq.input('TKIdXacNhan', sql.BigInt, dto.tkId);
        completeProcReq.input('TenNguoiXacNhan', sql.NVarChar(200), dto.tenNguoiXacNhan);
        await completeProcReq.execute('wh_PhieuSoanHang_XacNhanXuat');

        // Cáº­p nháº­t ÄÆ¡n Ä‘áº·t hÃ ng LSX (OMM_DonDatHang_LSX) vÃ  sá»‘ lÆ°á»£ng thá»±c xuáº¥t
        if (header.LoaiLenh === 'DonDatHang' && header.LenhId) {
          const ddhReq = new sql.Request(transaction);
          ddhReq.input('lenhId', sql.BigInt, header.LenhId);
          ddhReq.input('phieuSoanHangId', sql.BigInt, dto.PhieuSoanHangId);
          await ddhReq.query(`
            UPDATE dbo.OMM_DonDatHang_LSX 
            SET TrangThai = 'HoanThanh' 
            WHERE DonDatHangId = @lenhId;

            UPDATE d_ct
            SET d_ct.SoLuongThucXuat = ISNULL(p_ct.SoLuongThucSoan, 0)
            FROM dbo.OMM_DonDatHang_LSX_ChiTiet d_ct
            INNER JOIN dbo.WH_PhieuSoanHang psh ON psh.LenhId = d_ct.DonDatHangId AND psh.LoaiLenh = 'DonDatHang'
            INNER JOIN dbo.WH_ChiTietPhieuSoanHang p_ct ON p_ct.PhieuSoanHangId = psh.PhieuSoanHangId 
              AND ((p_ct.ChiTietDonDatHangId IS NOT NULL AND p_ct.ChiTietDonDatHangId = d_ct.CTDonDatHangId) OR (p_ct.VTId IS NOT NULL AND p_ct.VTId = d_ct.VTId) OR p_ct.Item = d_ct.MaVatTu)
            WHERE psh.PhieuSoanHangId = @phieuSoanHangId;
          `);
        }

        tinhTrangMoi = 'hoanthanh';
      } else {
        // Xuáº¥t theo Ä‘á»£t (xuáº¥t thiáº¿u): phiáº¿u giá»¯ tráº¡ng thÃ¡i 'dangthuchien'
        const partialReq = new sql.Request(transaction);
        partialReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
        partialReq.input('account', sql.BigInt, dto.tkId);
        partialReq.input('name', sql.NVarChar(200), dto.tenNguoiXacNhan);
        await partialReq.query(`
          UPDATE dbo.WH_PhieuSoanHang 
          SET TinhTrang = 'dangthuchien',
              NguoiXacNhan = @account,
              TKIdXacNhan = @account,
              TenNguoiXacNhan = @name,
              ThoiGianXacNhanXuat = GETDATE()
          WHERE PhieuSoanHangId = @id
        `);

        tinhTrangMoi = 'dangthuchien';
      }

      await transaction.commit();

      return {
        dotXuatId: batchId,
        soDot,
        tinhTrang: tinhTrangMoi,
        isHoanThanh: tinhTrangMoi === 'hoanthanh',
        soCayMoiXuat: newItemsToBatch.length,
        tongSoCayDaQuet: scannedRows.length,
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
