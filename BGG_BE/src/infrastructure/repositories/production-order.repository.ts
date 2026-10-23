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
        (SELECT COUNT(*) FROM dbo.OMM_DonDatHang_LSX d WHERE d.LSXId = lsx.LSXId AND d.LoaiDatHang = N'NguyenLieu' AND ISNULL(d.TrangThai, N'') <> N'DaHuy') AS SoDonCat,
        (SELECT COUNT(*) FROM dbo.OMM_DonDatHang_LSX d WHERE d.LSXId = lsx.LSXId AND d.LoaiDatHang = N'PhuLieu' AND ISNULL(d.TrangThai, N'') <> N'DaHuy') AS SoDonMay
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
          CASE
            WHEN d.LoaiDatHang = N'NguyenLieu' THEN N'Nguyên liệu (Kho Vải)'
            ELSE N'Phụ liệu (Kho Phụ Liệu)'
          END AS TenLoaiDatHang,
          d.NguoiDat,
          d.TKId,
          d.NgayDat,
          d.NgayCanGiao,
          d.GhiChuLot,
          d.GhiChu,
          d.TrangThai,
          CASE
            WHEN d.TrangThai = N'DaHuy' THEN N'Đã hủy'
            WHEN d.TrangThai = N'HoanThanh' OR ISNULL(psh.TinhTrang, N'') = N'hoanthanh' THEN N'Đã hoàn tất xuất kho'
            WHEN ISNULL(psh.TinhTrang, N'') = N'dangthuchien' THEN N'Kho đang quét soạn hàng'
            WHEN d.PhieuSoanHangId IS NOT NULL AND ISNULL(psh.TinhTrang, N'') = N'moitao' THEN N'Đã tạo Phiếu soạn (Chưa quét)'
            ELSE N'Chờ Kho tạo Phiếu soạn'
          END AS TenTrangThai,
          d.PhieuSoanHangId,
          CASE WHEN ISNULL(psh.TinhTrang, N'') = N'huy' THEN N'' ELSE ISNULL(psh.MaSoPhieuSoan, N'') END AS MaSoPhieuSoan,
          ISNULL(psh.TinhTrang, N'') AS TinhTrangPSH,
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

  private isNguyenLieuGroup(loaiNPL?: string): boolean {
    if (!loaiNPL || !loaiNPL.trim()) return false;
    const s = loaiNPL.trim().toUpperCase();
    return (
      s.includes('NGUYÊN LIỆU') ||
      s.includes('NGUYEN LIEU') ||
      s.includes('VẢI') ||
      s.includes('VAI') ||
      s.includes('MEX')
    );
  }

  private normalizeLoaiNPL(rawLoaiNPL?: string, maChungLoai?: string): string {
    if (this.isNguyenLieuGroup(rawLoaiNPL)) {
      return 'NGUYÊN LIỆU';
    }

    if (
      (!rawLoaiNPL || !rawLoaiNPL.trim()) &&
      maChungLoai &&
      maChungLoai.trim()
    ) {
      const mc = maChungLoai.trim().toUpperCase();
      if (
        mc.startsWith('N.') ||
        mc.includes('VẢI') ||
        mc.includes('VAI') ||
        mc.includes('MEX')
      ) {
        return 'NGUYÊN LIỆU';
      }
    }

    return 'PHỤ LIỆU';
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

    if (rawCode) {
      if (rawCode === 'ALL') return true;

      const codeTokens = rawCode
        .split(/[\s,;/|]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (
        codeTokens.length > 0 &&
        ((rowTenMau && codeTokens.includes(rowTenMau)) ||
          (rowCodeMau && codeTokens.includes(rowCodeMau)))
      ) {
        return true;
      }

      if (
        (rowTenMau && rawCode === rowTenMau) ||
        (rowCodeMau && rawCode === rowCodeMau)
      ) {
        return true;
      }
    }

    if (rawMau) {
      if (rawMau === 'ALL') return true;

      if (
        (rowTenMau && rawMau.includes(rowTenMau)) ||
        (rowCodeMau && rawMau.includes(rowCodeMau))
      ) {
        return true;
      }
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
    if (rawSize === 'ALL' || rawSize === 'FREE') {
      return true;
    }

    const rowSize = (row.tenSize || '').trim().toUpperCase();
    if (!rowSize) {
      return true;
    }

    if (rawSize && rawSize === rowSize) {
      return true;
    }

    if (rawSize) {
      const sizeTokens = rawSize
        .split(/[,;/|]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (sizeTokens.includes(rowSize)) {
        return true;
      }
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

    const loaiFilter = (dto.loaiDatHang || 'ALL').trim();
    let filterLoaiSql = '';
    if (loaiFilter.toLowerCase() === 'nguyenlieu') {
      filterLoaiSql = `
        AND (
          ISNULL(LoaiNPL, N'') COLLATE Latin1_General_CI_AI LIKE N'%NGUYEN LIEU%'
          OR ISNULL(LoaiNPL, N'') COLLATE Latin1_General_CI_AI LIKE N'%VAI%'
          OR ISNULL(LoaiNPL, N'') COLLATE Latin1_General_CI_AI LIKE N'%MEX%'
        )
      `;
    } else if (loaiFilter.toLowerCase() === 'phulieu') {
      filterLoaiSql = `
        AND (
          ISNULL(LoaiNPL, N'') COLLATE Latin1_General_CI_AI LIKE N'%PHU LIEU%'
          OR (
            ISNULL(LoaiNPL, N'') COLLATE Latin1_General_CI_AI NOT LIKE N'%NGUYEN LIEU%'
            AND ISNULL(LoaiNPL, N'') COLLATE Latin1_General_CI_AI NOT LIKE N'%VAI%'
            AND ISNULL(LoaiNPL, N'') COLLATE Latin1_General_CI_AI NOT LIKE N'%MEX%'
          )
        )
      `;
    }

    const results: any[] = [];
    const lotText = (dto.ghiChuLot || '').trim();

    for (const poId of distinctPoIds) {
      const poRows = validRows.filter((r) => Number(r.poId) === poId);
      const req = pool.request().input('POId', sql.BigInt, poId);

      const bomRes = await req.query(`
        SELECT 
          PDMId,
          POId,
          ISNULL(VTId, 0) AS VTId,
          ISNULL(MaChungLoai, N'') AS MaChungLoai,
          ISNULL(TenChungLoai, N'') AS TenChungLoai,
          ISNULL(Item, N'') AS Item,
          ISNULL(MaMau, N'') AS MaMau,
          ISNULL(DienGiai, N'') AS DienGiai,
          ISNULL(MauSanPham, N'') AS MauSanPham,
          ISNULL(CodeMauSP, N'') AS CodeMauSP,
          ISNULL(PhoiSize, N'') AS PhoiSize,
          ISNULL(Size, N'') AS Size,
          ISNULL(DVT, N'') AS DVT,
          ISNULL(LoaiNPL, N'') AS LoaiNPL,
          COALESCE(NULLIF(DinhMuc, 0), NULLIF(DinhMucChuan, 0), NULLIF(DinhMucKhachHang, 0), 0) AS DinhMucVal,
          ISNULL(QuyCach, N'') AS QuyCach
        FROM dbo.OMM_PO_BangDinhMuc
        WHERE POId = @POId ${filterLoaiSql}
        ORDER BY LoaiNPL, PDMId
      `);

      for (const bom of bomRes.recordset) {
        const dinhMuc = Number(bom.DinhMucVal || 0);
        if (dinhMuc <= 0) {
          continue;
        }

        const bcdCodeMauSP = (bom.CodeMauSP || '').trim();
        const bcdMauSP = (bom.MauSanPham || '').trim();
        const bcdSize = (bom.Size || '').trim();

        const matchingRows = poRows.filter(
          (row) =>
            this.matchesColor(bcdCodeMauSP, bcdMauSP, row) &&
            this.matchesSize(bcdSize, bom.PhoiSize, row),
        );

        const soLuongSP = matchingRows.reduce(
          (sum, r) => sum + Number(r.soLuongSanPham || 0),
          0,
        );

        if (soLuongSP <= 0) {
          continue;
        }

        const soLuongYeuCau = Math.round(dinhMuc * soLuongSP * 10000) / 10000;

        const itemCode = (bom.Item || '').trim();
        const maMau = (bom.MaMau || '').trim();
        const maChungLoai = (bom.MaChungLoai || '').trim();
        const dienGiai = (bom.DienGiai || '').trim();
        const rawLoaiNPL = (bom.LoaiNPL || '').trim();

        const loaiNPLGroup = this.normalizeLoaiNPL(rawLoaiNPL, maChungLoai);

        let maVatTuDisplay = itemCode || maChungLoai;
        if (
          maMau &&
          !maVatTuDisplay.toUpperCase().endsWith(`(${maMau.toUpperCase()})`)
        ) {
          maVatTuDisplay = `${maVatTuDisplay} (${maMau})`.trim();
        }
        if (maVatTuDisplay.length > 50) {
          maVatTuDisplay = maVatTuDisplay.substring(0, 50);
        }

        let tenVatTuDisplay = dienGiai;
        if (
          maChungLoai &&
          !tenVatTuDisplay.toUpperCase().startsWith(maChungLoai.toUpperCase())
        ) {
          tenVatTuDisplay = tenVatTuDisplay
            ? `${maChungLoai} - ${tenVatTuDisplay}`
            : maChungLoai;
        }
        if (bcdSize && bcdSize.toUpperCase() !== 'ALL') {
          tenVatTuDisplay = `${tenVatTuDisplay} [Cỡ: ${bcdSize}]`.trim();
        }
        if (tenVatTuDisplay.length > 250) {
          tenVatTuDisplay = tenVatTuDisplay.substring(0, 250);
        }

        results.push({
          PDMId: bom.PDMId,
          POId: bom.POId,
          VTId: Number(bom.VTId || 0),
          MaVatTu: maVatTuDisplay,
          TenVatTu: tenVatTuDisplay,
          MaChungLoai: maChungLoai,
          MaMau: maMau,
          CodeMauSP: bcdCodeMauSP,
          Size: bcdSize,
          DVT: (bom.DVT || '').trim(),
          LoaiNPL: loaiNPLGroup,
          DinhMuc: dinhMuc,
          SoLuongSanPham: soLuongSP,
          SoLuongYeuCau: soLuongYeuCau,
          GhiChuLot: lotText,
          GhiChu: lotText,
        });
      }
    }

    return results.sort((a, b) => {
      const groupA = a.LoaiNPL === 'NGUYÊN LIỆU' ? 0 : 1;
      const groupB = b.LoaiNPL === 'NGUYÊN LIỆU' ? 0 : 1;
      if (groupA !== groupB) return groupA - groupB;
      return String(a.TenVatTu || '').localeCompare(String(b.TenVatTu || ''));
    });
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

    // Phân nhóm vật tư đã chọn theo Nguyên liệu (Kho Vải) và Phụ liệu (Kho Phụ Liệu) giống Desktop
    const groupsByKho = new Map<'NguyenLieu' | 'PhuLieu', typeof validItems>();
    for (const item of validItems) {
      let loaiKho: 'NguyenLieu' | 'PhuLieu';
      if (item.loaiNPL && item.loaiNPL.trim()) {
        loaiKho = this.isNguyenLieuGroup(item.loaiNPL)
          ? 'NguyenLieu'
          : 'PhuLieu';
      } else {
        loaiKho = dto.loaiDatHang === 'PhuLieu' ? 'PhuLieu' : 'NguyenLieu';
      }
      if (!groupsByKho.has(loaiKho)) {
        groupsByKho.set(loaiKho, []);
      }
      groupsByKho.get(loaiKho)!.push(item);
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
          SELECT ISNULL(MAX(TRY_CAST(RIGHT(SoDonDatHang, 4) AS INT)), 0) AS MaxSeq
          FROM dbo.OMM_DonDatHang_LSX WITH (UPDLOCK, HOLDLOCK)
          WHERE SoDonDatHang LIKE @Prefix
        `);

      let currentSeq = Number(seqRes.recordset[0]?.MaxSeq ?? 0);
      const createdOrders: Array<{
        donDatHangId: number;
        soDonDatHang: string;
        loaiDatHang: string;
        soMatHang: number;
      }> = [];

      for (const [loaiKho, groupItems] of groupsByKho.entries()) {
        currentSeq += 1;
        const soDonDatHang = `${prefix}${String(currentSeq).padStart(4, '0')}`;

        const insertHeaderReq = new sql.Request(tx);
        insertHeaderReq.input('SoDDH', sql.NVarChar(50), soDonDatHang);
        insertHeaderReq.input('LSXId', sql.BigInt, dto.lsxId);
        insertHeaderReq.input('Loai', sql.NVarChar(50), loaiKho);
        insertHeaderReq.input(
          'NguoiDat',
          sql.NVarChar(150),
          dto.nguoiDat || '',
        );
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

        for (const item of groupItems) {
          const detailReq = new sql.Request(tx);
          const ghiChuItem =
            (item.ghiChuLot || item.ghiChu || dto.ghiChuLot || '').trim();
          detailReq.input('DDHId', sql.BigInt, donDatHangId);
          detailReq.input(
            'VTId',
            sql.BigInt,
            item.vtId != null ? Number(item.vtId) : 0,
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
          detailReq.input('GhiChu', sql.NVarChar(500), ghiChuItem);

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

        createdOrders.push({
          donDatHangId,
          soDonDatHang,
          loaiDatHang: loaiKho,
          soMatHang: groupItems.length,
        });
      }

      await tx.commit();

      const lastOrder = createdOrders[createdOrders.length - 1];
      return {
        donDatHangId: lastOrder.donDatHangId,
        soDonDatHang: createdOrders.map((o) => o.soDonDatHang).join(', '),
        lsxId: dto.lsxId,
        loaiDatHang: lastOrder.loaiDatHang,
        trangThai: 'ChoSoanHang',
        soMatHang: validItems.length,
        createdOrders,
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
        CASE
          WHEN d.LoaiDatHang = N'NguyenLieu' THEN N'Nguyên liệu (Kho Vải)'
          ELSE N'Phụ liệu (Kho Phụ Liệu)'
        END AS TenLoaiDatHang,
        d.NguoiDat,
        d.TKId,
        d.NgayDat,
        d.NgayCanGiao,
        d.GhiChuLot,
        d.GhiChu,
        d.TrangThai,
        CASE
          WHEN d.TrangThai = N'DaHuy' THEN N'Đã hủy'
          WHEN d.TrangThai = N'HoanThanh' OR ISNULL(psh.TinhTrang, N'') = N'hoanthanh' THEN N'Đã hoàn tất xuất kho'
          WHEN ISNULL(psh.TinhTrang, N'') = N'dangthuchien' THEN N'Kho đang quét soạn hàng'
          WHEN d.PhieuSoanHangId IS NOT NULL AND ISNULL(psh.TinhTrang, N'') = N'moitao' THEN N'Đã tạo Phiếu soạn (Chưa quét)'
          ELSE N'Chờ Kho tạo Phiếu soạn'
        END AS TenTrangThai,
        d.PhieuSoanHangId,
        CASE WHEN ISNULL(psh.TinhTrang, N'') = N'huy' THEN N'' ELSE ISNULL(psh.MaSoPhieuSoan, N'') END AS MaSoPhieuSoan,
        ISNULL(psh.TinhTrang, N'') AS TinhTrangPSH,
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
          CASE
            WHEN d.LoaiDatHang = N'NguyenLieu' THEN N'Nguyên liệu (Kho Vải)'
            ELSE N'Phụ liệu (Kho Phụ Liệu)'
          END AS TenLoaiDatHang,
          CASE
            WHEN d.TrangThai = N'DaHuy' THEN N'Đã hủy'
            WHEN d.TrangThai = N'HoanThanh' OR ISNULL(psh.TinhTrang, N'') = N'hoanthanh' THEN N'Đã hoàn tất xuất kho'
            WHEN ISNULL(psh.TinhTrang, N'') = N'dangthuchien' THEN N'Kho đang quét soạn hàng'
            WHEN d.PhieuSoanHangId IS NOT NULL AND ISNULL(psh.TinhTrang, N'') = N'moitao' THEN N'Đã tạo Phiếu soạn (Chưa quét)'
            ELSE N'Chờ Kho tạo Phiếu soạn'
          END AS TenTrangThai,
          lsx.SoLSX,
          lsx.MaHang,
          lsx.KhachHang,
          lsx.ToMay,
          lsx.NhaCat,
          CASE WHEN ISNULL(psh.TinhTrang, N'') = N'huy' THEN N'' ELSE ISNULL(psh.MaSoPhieuSoan, N'') END AS MaSoPhieuSoan,
          ISNULL(psh.TinhTrang, N'') AS TinhTrangPSH
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

  async huyDonDatHangLSX(
    donDatHangId: number,
    nguoiHuy?: string,
  ): Promise<any> {
    if (!donDatHangId || Number(donDatHangId) <= 0) {
      throw new BadRequestException('Mã đơn đặt hàng không hợp lệ');
    }

    const pool = await this.databaseService.getPool();
    const tx = new sql.Transaction(pool);

    await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      const checkRes = await new sql.Request(tx)
        .input('DonDatHangId', sql.BigInt, Number(donDatHangId))
        .query(`
          SELECT 
            d.DonDatHangId,
            d.SoDonDatHang,
            d.TrangThai,
            d.PhieuSoanHangId,
            psh.MaSoPhieuSoan,
            psh.TinhTrang AS TinhTrangPSH
          FROM dbo.OMM_DonDatHang_LSX d WITH (UPDLOCK, HOLDLOCK)
          LEFT JOIN dbo.WH_PhieuSoanHang psh WITH (UPDLOCK, HOLDLOCK)
            ON psh.PhieuSoanHangId = d.PhieuSoanHangId
          WHERE d.DonDatHangId = @DonDatHangId
        `);

      if (!checkRes.recordset.length) {
        throw new BadRequestException(
          'Không tìm thấy Đơn đặt hàng trên hệ thống.',
        );
      }

      const row = checkRes.recordset[0];
      const soDDH = String(row.SoDonDatHang || '');
      const trangThai = String(row.TrangThai || '').trim();
      const pshId =
        row.PhieuSoanHangId != null ? Number(row.PhieuSoanHangId) : null;
      const maPSH = String(row.MaSoPhieuSoan || '');
      const tinhTrangPSH = String(row.TinhTrangPSH || '')
        .trim()
        .toLowerCase();

      if (trangThai.toLowerCase() === 'dahuy') {
        throw new BadRequestException(
          `Đơn đặt hàng [${soDDH}] đã ở trạng thái Đã hủy.`,
        );
      }

      if (
        trangThai.toLowerCase() === 'hoanthanh' ||
        tinhTrangPSH === 'hoanthanh'
      ) {
        throw new BadRequestException(
          `Đơn đặt hàng [${soDDH}] đã hoàn tất xuất kho (PSH: ${maPSH}), không thể hủy!`,
        );
      }

      if (tinhTrangPSH === 'dangthuchien') {
        throw new BadRequestException(
          `Kho đang thực hiện quét soạn hàng cho phiếu [${maPSH}] của đơn [${soDDH}], không thể hủy!`,
        );
      }

      // Nếu đã tạo PSH ở trạng thái 'moitao' thì tự động hủy luôn PSH đó
      if (pshId && pshId > 0 && tinhTrangPSH !== 'huy') {
        await new sql.Request(tx)
          .input('PSHId', sql.BigInt, pshId)
          .query(`
            UPDATE dbo.WH_PhieuSoanHang
            SET TinhTrang = N'huy'
            WHERE PhieuSoanHangId = @PSHId
          `);
      }

      await new sql.Request(tx)
        .input('DonDatHangId', sql.BigInt, Number(donDatHangId))
        .query(`
          UPDATE dbo.OMM_DonDatHang_LSX
          SET TrangThai = N'DaHuy',
              PhieuSoanHangId = NULL
          WHERE DonDatHangId = @DonDatHangId
        `);

      await tx.commit();

      return {
        donDatHangId: Number(donDatHangId),
        soDonDatHang: soDDH,
        trangThai: 'DaHuy',
        nguoiHuy: nguoiHuy || '',
      };
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }
}
