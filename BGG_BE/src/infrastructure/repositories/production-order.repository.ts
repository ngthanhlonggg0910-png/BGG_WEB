import { Injectable, BadRequestException } from '@nestjs/common';
import sql from 'mssql';
import { DatabaseService } from '../database/database.service.js';
import type { IProductionOrderRepository } from '../../domain/repositories/production-order.repository.interface.js';
import {
  CalculateBomDto,
  CreateMaterialOrderDto,
  GetProductionOrdersDto,
  SelectedLsxRowDto,
} from '../../application/dtos/production-order.dto.js';

@Injectable()
export class ProductionOrderRepository implements IProductionOrderRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getDanhSachLSX(dto: GetProductionOrdersDto): Promise<any[]> {
    const pool = await this.databaseService.getPool();
    const req = pool.request();

    req.input('TuNgay', sql.DateTime, dto.tuNgay ? new Date(dto.tuNgay) : null);
    req.input(
      'DenNgay',
      sql.DateTime,
      dto.denNgay ? new Date(`${dto.denNgay}T23:59:59`) : null,
    );
    req.input(
      'TrangThai',
      sql.NVarChar(50),
      dto.trangThai && dto.trangThai.trim() !== '' ? dto.trangThai.trim() : null,
    );
    req.input(
      'Search',
      sql.NVarChar(100),
      dto.search && dto.search.trim() !== '' ? `%${dto.search.trim()}%` : null,
    );

    const query = `
      SELECT 
        lsx.LSXId,
        lsx.SoLSX,
        lsx.KHTId,
        lsx.DHId,
        lsx.MaHang,
        lsx.KhachHang,
        lsx.ChungLoai,
        lsx.DacDiem,
        lsx.ToMay,
        lsx.NhaCat,
        lsx.NgayCanMauCat,
        lsx.NgayVaoChuyen,
        lsx.ThuTuVaoChuyenCo,
        lsx.TinhTrangNPL,
        lsx.GhiChuCongDoan,
        lsx.TongSanLuong,
        lsx.NgayTao,
        lsx.TenNguoiTao,
        lsx.KeHoachDuyet,
        lsx.NguoiKHDuyet,
        lsx.NgayKHDuyet,
        lsx.QLDHDuyet,
        lsx.NguoiQLDHDuyet,
        lsx.NgayQLDHDuyet,
        lsx.TrangThai,
        lsx.LanPhatLenh,
        (SELECT COUNT(*) FROM dbo.OMM_LenhSanXuat_ChiTiet ct WHERE ct.LSXId = lsx.LSXId) AS SoDongChiTiet,
        (SELECT COUNT(*) FROM dbo.OMM_DonDatHang_LSX d WHERE d.LSXId = lsx.LSXId AND d.LoaiDatHang = N'NguyenLieu') AS SoDonCat,
        (SELECT COUNT(*) FROM dbo.OMM_DonDatHang_LSX d WHERE d.LSXId = lsx.LSXId AND d.LoaiDatHang = N'PhuLieu') AS SoDonMay
      FROM dbo.OMM_LenhSanXuat lsx
      WHERE (@TuNgay IS NULL OR lsx.NgayTao >= @TuNgay)
        AND (@DenNgay IS NULL OR lsx.NgayTao <= @DenNgay)
        AND (@TrangThai IS NULL OR lsx.TrangThai = @TrangThai)
        AND (
          @Search IS NULL
          OR lsx.SoLSX LIKE @Search
          OR lsx.MaHang LIKE @Search
          OR lsx.KhachHang LIKE @Search
          OR lsx.ToMay LIKE @Search
          OR lsx.NhaCat LIKE @Search
        )
      ORDER BY lsx.NgayTao DESC, lsx.LSXId DESC
    `;

    const result = await req.query(query);
    return result.recordset;
  }

  async getChiTietLSX(lsxId: number): Promise<any> {
    const pool = await this.databaseService.getPool();

    const headerRes = await pool
      .request()
      .input('LSXId', sql.BigInt, lsxId)
      .query(`SELECT * FROM dbo.OMM_LenhSanXuat WHERE LSXId = @LSXId`);

    if (!headerRes.recordset.length) {
      throw new BadRequestException(`Không tìm thấy Lệnh sản xuất #${lsxId}`);
    }

    const chiTietRes = await pool
      .request()
      .input('LSXId', sql.BigInt, lsxId)
      .query(`
        SELECT 
          ChiTietLSXId,
          LSXId,
          POId,
          PONo,
          ThiTruong,
          TenMau,
          CodeMau,
          LotVaiChinh,
          LotVaiLot,
          TenSize,
          SoLuong,
          NgayGiaoHang,
          STT
        FROM dbo.OMM_LenhSanXuat_ChiTiet
        WHERE LSXId = @LSXId
        ORDER BY STT, PONo, TenMau, TenSize
      `);

    const donDatHangRes = await pool
      .request()
      .input('LSXId', sql.BigInt, lsxId)
      .query(`
        SELECT 
          d.DonDatHangId,
          d.SoDonDatHang,
          d.LSXId,
          d.LoaiDatHang,
          d.NguoiDat,
          d.TKId,
          d.NgayDat,
          d.NgayCanGiao,
          d.GhiChuLot,
          d.GhiChu,
          d.TrangThai,
          d.PhieuSoanHangId,
          psh.MaSoPhieuSoan,
          psh.TinhTrang AS TinhTrangPSH,
          (SELECT COUNT(*) FROM dbo.OMM_DonDatHang_LSX_ChiTiet ct WHERE ct.DonDatHangId = d.DonDatHangId) AS SoMatHang
        FROM dbo.OMM_DonDatHang_LSX d
        LEFT JOIN dbo.WH_PhieuSoanHang psh ON d.PhieuSoanHangId = psh.PhieuSoanHangId
        WHERE d.LSXId = @LSXId
        ORDER BY d.NgayDat DESC, d.DonDatHangId DESC
      `);

    return {
      header: headerRes.recordset[0],
      chiTiet: chiTietRes.recordset,
      donDatHangList: donDatHangRes.recordset,
    };
  }

  private matchesColor(
    bomCodeMauSP: string,
    bomMauSanPham: string,
    row: SelectedLsxRowDto,
  ): boolean {
    const rawCode = (bomCodeMauSP || '').trim().toUpperCase();
    const rawMau = (bomMauSanPham || '').trim().toUpperCase();
    if (!rawCode && !rawMau) {
      return true;
    }

    const rowTenMau = (row.tenMau || '').trim().toUpperCase();
    const rowCodeMau = (row.codeMau || '').trim().toUpperCase();
    if (!rowTenMau && !rowCodeMau) {
      return true;
    }

    const codeTokens = rawCode
      .split(/[\s,;/|]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (
      codeTokens.length > 0 &&
      (codeTokens.includes(rowTenMau) ||
        (rowCodeMau && codeTokens.includes(rowCodeMau)))
    ) {
      return true;
    }

    if (
      rawMau &&
      ((rowTenMau && rawMau.includes(rowTenMau)) ||
        (rowCodeMau && rawMau.includes(rowCodeMau)))
    ) {
      return true;
    }

    return false;
  }

  private matchesSize(
    bomSize: string,
    bomPhoiSize: string,
    row: SelectedLsxRowDto,
  ): boolean {
    const rawSize = (bomSize || '').trim().toUpperCase();
    const rawPhoiSize = (bomPhoiSize || '').trim().toUpperCase();
    if (!rawSize && !rawPhoiSize) {
      return true;
    }

    const rowSize = (row.tenSize || '').trim().toUpperCase();
    if (!rowSize) {
      return true;
    }

    if (rawSize && rawSize === rowSize) {
      return true;
    }
    if (rawPhoiSize && rawPhoiSize.includes(rowSize)) {
      return true;
    }

    return false;
  }

  async tinhNhuCauVatTu(dto: CalculateBomDto): Promise<any[]> {
    const validRows = (dto.selectedRows || []).filter(
      (r) => Number(r.poId) > 0 && Number(r.soLuongSanPham) > 0,
    );

    if (validRows.length === 0) {
      return [];
    }

    const pool = await this.databaseService.getPool();
    const distinctPoIds = Array.from(
      new Set(validRows.map((r) => Number(r.poId))),
    );

    const filterLoai =
      dto.loaiDatHang === 'NguyenLieu'
        ? `AND (
            ISNULL(LoaiNPL, N'') LIKE N'%NGUYÊN LIỆU%'
            OR ISNULL(LoaiNPL, N'') LIKE N'%NGUYEN LIEU%'
            OR ISNULL(LoaiNPL, N'') LIKE N'%VẢI%'
            OR ISNULL(LoaiNPL, N'') LIKE N'%VAI%'
            OR ISNULL(LoaiNPL, N'') LIKE N'%MEX%'
          )`
        : `AND (
            ISNULL(LoaiNPL, N'') NOT LIKE N'%NGUYÊN LIỆU%'
            AND ISNULL(LoaiNPL, N'') NOT LIKE N'%NGUYEN LIEU%'
            AND ISNULL(LoaiNPL, N'') NOT LIKE N'%VẢI%'
            AND ISNULL(LoaiNPL, N'') NOT LIKE N'%VAI%'
          )`;

    const results: any[] = [];

    for (const poId of distinctPoIds) {
      const poRows = validRows.filter((r) => Number(r.poId) === poId);
      const req = pool.request().input('POId', sql.BigInt, poId);

      const bomRes = await req.query(`
        SELECT 
          PDMId,
          POId,
          VTId,
          ISNULL(NULLIF(LTRIM(RTRIM(Item)), N''), ISNULL(MaChungLoai, N'')) AS MaVatTu,
          ISNULL(NULLIF(LTRIM(RTRIM(DienGiai)), N''), ISNULL(TenChungLoai, N'')) AS TenVatTu,
          ISNULL(MaChungLoai, N'') AS MaChungLoai,
          ISNULL(TenChungLoai, N'') AS TenChungLoai,
          ISNULL(MaMau, N'') AS MaMau,
          ISNULL(MauSanPham, N'') AS MauSanPham,
          ISNULL(CodeMauSP, N'') AS CodeMauSP,
          ISNULL(PhoiSize, N'') AS PhoiSize,
          ISNULL(Size, N'') AS Size,
          ISNULL(DVT, N'') AS DVT,
          ISNULL(LoaiNPL, N'') AS LoaiNPL,
          COALESCE(NULLIF(DinhMuc, 0), NULLIF(DinhMucChuan, 0), NULLIF(DinhMucKhachHang, 0), 0) AS DinhMuc,
          ISNULL(QuyCach, N'') AS GhiChu
        FROM dbo.OMM_PO_BangDinhMuc
        WHERE POId = @POId ${filterLoai}
        ORDER BY LoaiNPL, PDMId
      `);

      for (const bom of bomRes.recordset) {
        const matchingRows = poRows.filter(
          (row) =>
            this.matchesColor(bom.CodeMauSP, bom.MauSanPham, row) &&
            this.matchesSize(bom.Size, bom.PhoiSize, row),
        );

        const soLuongSP = matchingRows.reduce(
          (sum, r) => sum + Number(r.soLuongSanPham || 0),
          0,
        );

        if (soLuongSP <= 0) {
          continue;
        }

        const dinhMuc = Number(bom.DinhMuc || 0);
        const soLuongYeuCau = Math.round(dinhMuc * soLuongSP * 10000) / 10000;

        const ghiChuParts: string[] = [];
        if (bom.CodeMauSP) ghiChuParts.push(`Màu SP: ${bom.CodeMauSP}`);
        if (bom.Size) ghiChuParts.push(`Size: ${bom.Size}`);
        if (bom.GhiChu) ghiChuParts.push(bom.GhiChu);

        results.push({
          PDMId: bom.PDMId,
          POId: bom.POId,
          VTId: bom.VTId,
          MaVatTu: bom.MaVatTu,
          TenVatTu: bom.TenVatTu,
          MaChungLoai: bom.MaChungLoai,
          MaMau: bom.MaMau,
          CodeMauSP: bom.CodeMauSP,
          Size: bom.Size,
          DVT: bom.DVT,
          LoaiNPL: bom.LoaiNPL,
          DinhMuc: dinhMuc,
          SoLuongSanPham: soLuongSP,
          SoLuongYeuCau: soLuongYeuCau,
          GhiChu: ghiChuParts.join(' | '),
        });
      }
    }

    return results;
  }

  async taoDonDatHangVatTu(dto: CreateMaterialOrderDto): Promise<any> {
    if (!dto.lsxId) {
      throw new BadRequestException('Thiếu thông tin Lệnh sản xuất (lsxId)');
    }

    const validItems = (dto.items || []).filter(
      (item) => Number(item.soLuongYeuCau) > 0,
    );

    if (validItems.length === 0) {
      throw new BadRequestException(
        'Danh sách vật tư đặt hàng trống hoặc số lượng yêu cầu bằng 0',
      );
    }

    const pool = await this.databaseService.getPool();
    const tx = new sql.Transaction(pool);

    await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `DDH-${yyyy}${mm}-`;

      const seqRes = await new sql.Request(tx)
        .input('Prefix', sql.NVarChar(30), `${prefix}%`)
        .query(`
          SELECT ISNULL(MAX(TRY_CAST(RIGHT(SoDonDatHang, 4) AS INT)), 0) + 1 AS NextSeq
          FROM dbo.OMM_DonDatHang_LSX WITH (UPDLOCK, HOLDLOCK)
          WHERE SoDonDatHang LIKE @Prefix
        `);

      const nextSeq = Number(seqRes.recordset[0]?.NextSeq ?? 1);
      const soDonDatHang = `${prefix}${String(nextSeq).padStart(4, '0')}`;

      const insertHeaderReq = new sql.Request(tx);
      insertHeaderReq.input('SoDDH', sql.NVarChar(50), soDonDatHang);
      insertHeaderReq.input('LSXId', sql.BigInt, dto.lsxId);
      insertHeaderReq.input(
        'Loai',
        sql.NVarChar(50),
        dto.loaiDatHang || 'NguyenLieu',
      );
      insertHeaderReq.input('NguoiDat', sql.NVarChar(150), dto.nguoiDat || '');
      insertHeaderReq.input('TKId', sql.BigInt, dto.tkId || null);
      insertHeaderReq.input(
        'NgayGiao',
        sql.DateTime,
        dto.ngayCanGiao ? new Date(dto.ngayCanGiao) : null,
      );
      insertHeaderReq.input('Lot', sql.NVarChar(500), dto.ghiChuLot || '');
      insertHeaderReq.input('GhiChu', sql.NVarChar(500), dto.ghiChu || '');

      const headerInsertRes = await insertHeaderReq.query(`
        INSERT INTO dbo.OMM_DonDatHang_LSX (
          SoDonDatHang, LSXId, LoaiDatHang, NguoiDat, TKId, NgayDat,
          NgayCanGiao, GhiChuLot, GhiChu, TrangThai
        )
        VALUES (
          @SoDDH, @LSXId, @Loai, @NguoiDat, @TKId, GETDATE(),
          @NgayGiao, @Lot, @GhiChu, N'ChoSoanHang'
        );
        SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS DonDatHangId;
      `);

      const donDatHangId = Number(headerInsertRes.recordset[0].DonDatHangId);

      for (const item of validItems) {
        const detailReq = new sql.Request(tx);
        detailReq.input('DDHId', sql.BigInt, donDatHangId);
        detailReq.input(
          'VTId',
          sql.BigInt,
          item.vtId != null ? Number(item.vtId) : null,
        );
        detailReq.input('MaVT', sql.NVarChar(100), item.maVatTu || '');
        detailReq.input('TenVT', sql.NVarChar(500), item.tenVatTu || '');
        detailReq.input('DVT', sql.NVarChar(50), item.dvt || '');
        detailReq.input('LoaiNPL', sql.NVarChar(100), item.loaiNPL || '');
        detailReq.input('DM', sql.Float, Number(item.dinhMuc || 0));
        detailReq.input(
          'SLSP',
          sql.Int,
          Math.round(Number(item.soLuongSanPham || 0)),
        );
        detailReq.input('SLYC', sql.Float, Number(item.soLuongYeuCau || 0));
        detailReq.input('GhiChu', sql.NVarChar(500), item.ghiChu || '');

        await detailReq.query(`
          INSERT INTO dbo.OMM_DonDatHang_LSX_ChiTiet (
            DonDatHangId, VTId, MaVatTu, TenVatTu, DVT, LoaiNPL,
            DinhMuc, SoLuongSanPham, SoLuongYeuCau, GhiChu
          )
          VALUES (
            @DDHId, @VTId, @MaVT, @TenVT, @DVT, @LoaiNPL,
            @DM, @SLSP, @SLYC, @GhiChu
          )
        `);
      }

      await tx.commit();

      return {
        donDatHangId,
        soDonDatHang,
        lsxId: dto.lsxId,
        loaiDatHang: dto.loaiDatHang,
        trangThai: 'ChoSoanHang',
        soMatHang: validItems.length,
      };
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async getDanhSachDonDatHangLSX(params: {
    lsxId?: number;
    loaiDatHang?: string;
    trangThai?: string;
  }): Promise<any[]> {
    const pool = await this.databaseService.getPool();
    const req = pool.request();
    req.input('LSXId', sql.BigInt, params.lsxId ? Number(params.lsxId) : null);
    req.input('LoaiDatHang', sql.NVarChar(50), params.loaiDatHang || null);
    req.input('TrangThai', sql.NVarChar(50), params.trangThai || null);

    const res = await req.query(`
      SELECT 
        d.DonDatHangId,
        d.SoDonDatHang,
        d.LSXId,
        lsx.SoLSX,
        lsx.MaHang,
        lsx.KhachHang,
        lsx.ToMay,
        lsx.NhaCat,
        d.LoaiDatHang,
        d.NguoiDat,
        d.TKId,
        d.NgayDat,
        d.NgayCanGiao,
        d.GhiChuLot,
        d.GhiChu,
        d.TrangThai,
        d.PhieuSoanHangId,
        psh.MaSoPhieuSoan,
        psh.TinhTrang AS TinhTrangPSH,
        (SELECT COUNT(*) FROM dbo.OMM_DonDatHang_LSX_ChiTiet ct WHERE ct.DonDatHangId = d.DonDatHangId) AS SoMatHang
      FROM dbo.OMM_DonDatHang_LSX d
      INNER JOIN dbo.OMM_LenhSanXuat lsx ON d.LSXId = lsx.LSXId
      LEFT JOIN dbo.WH_PhieuSoanHang psh ON d.PhieuSoanHangId = psh.PhieuSoanHangId
      WHERE (@LSXId IS NULL OR d.LSXId = @LSXId)
        AND (@LoaiDatHang IS NULL OR d.LoaiDatHang = @LoaiDatHang)
        AND (@TrangThai IS NULL OR d.TrangThai = @TrangThai)
      ORDER BY d.NgayDat DESC, d.DonDatHangId DESC
    `);

    return res.recordset;
  }

  async getChiTietDonDatHangLSX(donDatHangId: number): Promise<any> {
    const pool = await this.databaseService.getPool();

    const headerRes = await pool
      .request()
      .input('DDHId', sql.BigInt, donDatHangId)
      .query(`
        SELECT 
          d.*,
          lsx.SoLSX,
          lsx.MaHang,
          lsx.KhachHang,
          lsx.ToMay,
          lsx.NhaCat,
          psh.MaSoPhieuSoan,
          psh.TinhTrang AS TinhTrangPSH
        FROM dbo.OMM_DonDatHang_LSX d
        INNER JOIN dbo.OMM_LenhSanXuat lsx ON d.LSXId = lsx.LSXId
        LEFT JOIN dbo.WH_PhieuSoanHang psh ON d.PhieuSoanHangId = psh.PhieuSoanHangId
        WHERE d.DonDatHangId = @DDHId
      `);

    const chiTietRes = await pool
      .request()
      .input('DDHId', sql.BigInt, donDatHangId)
      .query(`
        SELECT 
          ct.CTDonDatHangId AS ChiTietId,
          ct.DonDatHangId,
          ct.VTId,
          ct.MaVatTu,
          ct.TenVatTu,
          ct.DVT,
          ct.LoaiNPL,
          ct.DinhMuc,
          ct.SoLuongSanPham,
          ct.SoLuongYeuCau,
          ISNULL(psh_ct.SoLuongThucSoan, ISNULL(ct.SoLuongThucXuat, 0)) AS SoLuongThucXuat,
          ct.GhiChu
        FROM dbo.OMM_DonDatHang_LSX_ChiTiet ct
        INNER JOIN dbo.OMM_DonDatHang_LSX d ON ct.DonDatHangId = d.DonDatHangId
        LEFT JOIN dbo.WH_ChiTietPhieuSoanHang psh_ct
          ON psh_ct.PhieuSoanHangId = d.PhieuSoanHangId
          AND psh_ct.ChiTietLenhId = ct.CTDonDatHangId
        WHERE ct.DonDatHangId = @DDHId
        ORDER BY ct.LoaiNPL, ct.MaVatTu
      `);

    return {
      header: headerRes.recordset[0] || null,
      chiTiet: chiTietRes.recordset,
    };
  }
}
