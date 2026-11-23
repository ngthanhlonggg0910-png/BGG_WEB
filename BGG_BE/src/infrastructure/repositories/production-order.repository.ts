import { PushService } from '../../application/services/push.service.js';
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import sql from 'mssql';
import { DatabaseService } from '../database/database.service.js';
import type { IProductionOrderRepository } from '../../domain/repositories/production-order.repository.interface.js';
import {
  CalculateBomDto,
  CreateMaterialOrderDto,
  GetProductionOrdersDto,
} from '../../application/dtos/production-order.dto.js';
import {
  LOAI_NPL_LABEL,
  MATERIAL_ORDER_DEPARTMENTS,
  buildMaterialDisplay,
  classifyLoaiKho,
  matchesColor,
  matchesSize,
  type LoaiKho,
  type QuyenDatHangLSX,
} from '../../domain/production-order/material-rules.js';
import { buildMaterialTracking } from '../../domain/production-order/material-tracking.js';

const MAX_ITEMS_PER_ORDER = 2000;
const MAX_QTY = 1e9;

function toPositiveInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().substring(0, max) : '';
}

@Injectable()
export class ProductionOrderRepository implements IProductionOrderRepository {
  constructor(private readonly databaseService: DatabaseService, private readonly push: PushService) {}

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

  /** Name of the logged-in account, read from the DB rather than trusted from the client. */
  private async getTenNguoiThaoTac(
    runner: sql.ConnectionPool | sql.Transaction,
    tkId: number,
  ): Promise<string> {
    const res = await (runner instanceof sql.Transaction ? new sql.Request(runner) : runner.request()).input('TKId', sql.BigInt, tkId).query(`
      SELECT TOP 1
        tk.TenDangNhap,
        LTRIM(RTRIM(CONCAT(nv.HoVaTenLot, N' ', nv.Ten))) AS HoTen
      FROM dbo.Lib_TaiKhoan tk
      LEFT JOIN dbo.Lib_NhanVien_TaiKhoan nvtk ON nvtk.TenDangNhap = tk.TenDangNhap
      LEFT JOIN dbo.Lib_NhanVien nv ON nv.NVId = nvtk.NVId
      WHERE tk.UId = @TKId
      ORDER BY nvtk.UEId DESC
    `);
    const row = res.recordset?.[0];
    if (!row) {
      throw new ForbiddenException('Tài khoản đăng nhập không tồn tại trên hệ thống.');
    }
    return String(row.HoTen || row.TenDangNhap || '').trim();
  }

  /**
   * Accounts with an active employee link in one of MATERIAL_ORDER_DEPARTMENTS
   * (XÍ NGHIỆP MAY 1, XÍ NGHIỆP MAY 2, DEVELOPER) may place and cancel LSX material orders.
   */
  private async getQuyen(
    runner: sql.ConnectionPool | sql.Transaction,
    tkId: number,
  ): Promise<QuyenDatHangLSX> {
    const req = (
      runner instanceof sql.Transaction ? new sql.Request(runner) : runner.request()
    ).input('TKId', sql.BigInt, tkId);
    const names = MATERIAL_ORDER_DEPARTMENTS.map((name, i) => {
      req.input(`Pb${i}`, sql.NVarChar(250), name);
      return `@Pb${i}`;
    });
    const res = await req.query(`
      SELECT TOP 1 1 AS Ok
      FROM dbo.Lib_TaiKhoan tk
      INNER JOIN dbo.Lib_NhanVien_TaiKhoan nvtk ON nvtk.TenDangNhap = tk.TenDangNhap AND nvtk.isActived = 1
      INNER JOIN dbo.Lib_NhanVien nv ON nv.NVId = nvtk.NVId
      INNER JOIN dbo.Lib_PhongBan pb ON pb.PbId = nv.PbId
      WHERE tk.UId = @TKId
        AND LTRIM(RTRIM(pb.TenPhongBan)) COLLATE Latin1_General_CI_AI IN (${names.join(', ')})
    `);
    const ok = res.recordset.length > 0;
    return { datHang: ok, huyDon: ok };
  }

  private async assertQuyen(
    runner: sql.ConnectionPool | sql.Transaction,
    tkId: number,
    quyen: keyof QuyenDatHangLSX,
  ): Promise<void> {
    if (!(await this.getQuyen(runner, tkId))[quyen]) {
      throw new ForbiddenException(
        `Chỉ tài khoản thuộc ${MATERIAL_ORDER_DEPARTMENTS.join(' / ')} mới được ${
          quyen === 'datHang' ? 'đặt hàng' : 'hủy đơn đặt hàng'
        } vật tư LSX.`,
      );
    }
  }

  /**
   * Theo dõi vật tư của 1 LSX: các đơn đã đặt, số đã xuất / đã nhận theo từng dòng và còn lại.
   * "Đã nhận" = cây được xí nghiệp xác nhận (isXacNhan = 1) trên phiếu soạn chưa hủy của đơn.
   * Phiếu soạn do Desktop (NVS_OMM) tạo không ghi ChiTietDonDatHangId, nên các dòng đó
   * được nối theo mã + tên vật tư trong cùng đơn.
   */
  async getTheoDoiVatTuLSX(lsxId: number): Promise<any> {
    const id = toPositiveInt(lsxId);
    if (!id) throw new BadRequestException('Mã Lệnh sản xuất không hợp lệ');

    const pool = await this.databaseService.getPool();
    const headerRes = await pool
      .request()
      .input('LSXId', sql.BigInt, id)
      .query(`
        SELECT LSXId, SoLSX, MaHang, KhachHang, ChungLoai, ToMay, NhaCat, NgayCanMauCat,
               NgayVaoChuyen, TongSanLuong, TrangThai, NgayTao, TenNguoiTao
        FROM dbo.OMM_LenhSanXuat WHERE LSXId = @LSXId
      `);
    if (!headerRes.recordset.length) {
      throw new BadRequestException(`Không tìm thấy Lệnh sản xuất #${id}`);
    }

    const ordersRes = await pool
      .request()
      .input('LSXId', sql.BigInt, id)
      .query(`
        SELECT
          d.DonDatHangId,
          d.SoDonDatHang,
          d.LoaiDatHang,
          CASE
            WHEN d.LoaiDatHang = N'NguyenLieu' THEN N'Nguyên liệu (Kho Vải)'
            ELSE N'Phụ liệu (Kho Phụ Liệu)'
          END AS TenLoaiDatHang,
          d.NguoiDat,
          d.NgayDat,
          d.NgayCanGiao,
          d.GhiChuLot,
          d.GhiChu,
          d.TrangThai,
          CASE
            WHEN d.TrangThai = N'DaHuy' THEN N'Đã hủy'
            WHEN d.TrangThai = N'DaNhanHang' THEN N'Xí nghiệp đã nhận hàng'
            WHEN d.TrangThai = N'HoanThanh' OR ISNULL(psh.TinhTrang, N'') = N'hoanthanh' THEN N'Đã hoàn tất xuất kho'
            WHEN ISNULL(psh.TinhTrang, N'') = N'dangthuchien' THEN N'Kho đang quét soạn hàng'
            WHEN d.PhieuSoanHangId IS NOT NULL AND ISNULL(psh.TinhTrang, N'') = N'moitao' THEN N'Đã tạo Phiếu soạn (Chưa quét)'
            ELSE N'Chờ Kho tạo Phiếu soạn'
          END AS TenTrangThai,
          d.PhieuSoanHangId,
          CASE WHEN ISNULL(psh.TinhTrang, N'') = N'huy' THEN N'' ELSE ISNULL(psh.MaSoPhieuSoan, N'') END AS MaSoPhieuSoan,
          ISNULL(psh.TinhTrang, N'') AS TinhTrangPSH
        FROM dbo.OMM_DonDatHang_LSX d
        LEFT JOIN dbo.WH_PhieuSoanHang psh ON psh.PhieuSoanHangId = d.PhieuSoanHangId
        WHERE d.LSXId = @LSXId
        ORDER BY d.NgayDat DESC, d.DonDatHangId DESC
      `);

    const linesRes = await pool
      .request()
      .input('LSXId', sql.BigInt, id)
      .query(`
        SELECT
          ct.CTDonDatHangId,
          ct.DonDatHangId,
          ct.VTId,
          ct.MaVatTu,
          ct.TenVatTu,
          ct.DVT,
          ct.LoaiNPL,
          ct.SoLuongYeuCau,
          r.SoLuongThucSoan,
          r.SoLuongXuat,
          r.SoLuongDaNhan,
          r.SoCay,
          r.SoCayDaNhan,
          r.ThoiGianNhanMoiNhat
        FROM dbo.OMM_DonDatHang_LSX_ChiTiet ct
        INNER JOIN dbo.OMM_DonDatHang_LSX d ON d.DonDatHangId = ct.DonDatHangId
        OUTER APPLY (
          SELECT
            SUM(ISNULL(s.SoLuongThucSoan, 0)) AS SoLuongThucSoan,
            SUM(cay.SoLuongXuat) AS SoLuongXuat,
            SUM(cay.SoLuongDaNhan) AS SoLuongDaNhan,
            SUM(cay.SoCay) AS SoCay,
            SUM(cay.SoCayDaNhan) AS SoCayDaNhan,
            MAX(cay.ThoiGianNhanMoiNhat) AS ThoiGianNhanMoiNhat
          FROM dbo.WH_PhieuSoanHang psh
          INNER JOIN dbo.WH_ChiTietPhieuSoanHang s ON s.PhieuSoanHangId = psh.PhieuSoanHangId
          OUTER APPLY (
            SELECT
              COUNT(c.CayId) AS SoCay,
              SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN 1 ELSE 0 END) AS SoCayDaNhan,
              SUM(ISNULL(c.SoLuong, 0)) AS SoLuongXuat,
              SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN ISNULL(c.SoLuongThucNhan, c.SoLuong) ELSE 0 END) AS SoLuongDaNhan,
              MAX(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN c.ThoiGianXacNhan END) AS ThoiGianNhanMoiNhat
            FROM dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c
            WHERE c.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
          ) cay
          -- Only the picking order linked on the LSX order itself: LoaiLenh = 'DonDatHang' + LenhId
          -- is also used by the desktop Lệnh cấp phát orders (MRP_LCP_DonDatHang), whose ids
          -- can collide with OMM_DonDatHang_LSX ids.
          WHERE psh.PhieuSoanHangId = d.PhieuSoanHangId
            AND ISNULL(psh.TinhTrang, N'') <> N'huy'
            AND (
              s.ChiTietDonDatHangId = ct.CTDonDatHangId
              OR (
                s.ChiTietDonDatHangId IS NULL
                AND ISNULL(s.Item, N'') = LEFT(ISNULL(ct.MaVatTu, N''), 50)
                AND ISNULL(s.DienGiai, N'') = ISNULL(ct.TenVatTu, N'')
              )
            )
        ) r
        WHERE d.LSXId = @LSXId
        ORDER BY ct.DonDatHangId, ct.LoaiNPL, ct.MaVatTu
      `);

    return {
      header: headerRes.recordset[0],
      ...buildMaterialTracking(ordersRes.recordset, linesRes.recordset),
    };
  }

  async getQuyenDatHang(tkId: number): Promise<QuyenDatHangLSX> {
    const pool = await this.databaseService.getPool();
    return this.getQuyen(pool, tkId);
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

    // Classification is done in JS with classifyLoaiKho (not in SQL) so that the list shown,
    // the label and the warehouse the order goes to always agree.
    const loaiFilter = String(dto.loaiDatHang || 'ALL').trim().toLowerCase();
    const wantedKho: LoaiKho | null =
      loaiFilter === 'nguyenlieu' ? 'NguyenLieu' : loaiFilter === 'phulieu' ? 'PhuLieu' : null;

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
        WHERE POId = @POId
        ORDER BY LoaiNPL, PDMId
      `);

      for (const bom of bomRes.recordset) {
        const dinhMuc = Number(bom.DinhMucVal || 0);
        if (dinhMuc <= 0) {
          continue;
        }

        const loaiKho = classifyLoaiKho(bom.LoaiNPL, bom.MaChungLoai);
        if (wantedKho && loaiKho !== wantedKho) {
          continue;
        }

        const bcdCodeMauSP = (bom.CodeMauSP || '').trim();
        const bcdMauSP = (bom.MauSanPham || '').trim();
        const bcdSize = (bom.Size || '').trim();

        const matchingRows = poRows.filter(
          (row) =>
            matchesColor(bcdCodeMauSP, bcdMauSP, row) &&
            matchesSize(bcdSize, bom.PhoiSize, row),
        );

        const soLuongSP = matchingRows.reduce(
          (sum, r) => sum + Number(r.soLuongSanPham || 0),
          0,
        );

        if (soLuongSP <= 0) {
          continue;
        }

        const soLuongYeuCau = Math.round(dinhMuc * soLuongSP * 10000) / 10000;

        const { maVatTu, tenVatTu } = buildMaterialDisplay(bom);

        results.push({
          PDMId: bom.PDMId,
          POId: bom.POId,
          VTId: Number(bom.VTId || 0),
          MaVatTu: maVatTu,
          TenVatTu: tenVatTu,
          MaChungLoai: (bom.MaChungLoai || '').trim(),
          MaMau: (bom.MaMau || '').trim(),
          CodeMauSP: bcdCodeMauSP,
          Size: bcdSize,
          DVT: (bom.DVT || '').trim(),
          LoaiKho: loaiKho,
          LoaiNPL: LOAI_NPL_LABEL[loaiKho],
          DinhMuc: dinhMuc,
          SoLuongSanPham: soLuongSP,
          SoLuongYeuCau: soLuongYeuCau,
          GhiChuLot: lotText,
          GhiChu: lotText,
        });
      }
    }

    return results.sort((a, b) => {
      const groupA = a.LoaiKho === 'NguyenLieu' ? 0 : 1;
      const groupB = b.LoaiKho === 'NguyenLieu' ? 0 : 1;
      if (groupA !== groupB) return groupA - groupB;
      return String(a.TenVatTu || '').localeCompare(String(b.TenVatTu || ''));
    });
  }

  async taoDonDatHangVatTu(dto: CreateMaterialOrderDto, tkId: number): Promise<any> {
    const lsxId = toPositiveInt(dto?.lsxId);
    if (!lsxId) {
      throw new BadRequestException('Thiếu thông tin Lệnh sản xuất (lsxId)');
    }

    const rawItems = Array.isArray(dto?.items) ? dto.items : [];
    if (rawItems.length > MAX_ITEMS_PER_ORDER) {
      throw new BadRequestException(
        `Một lần đặt tối đa ${MAX_ITEMS_PER_ORDER} dòng vật tư.`,
      );
    }
    for (const item of rawItems) {
      const qty = Number(item?.soLuongYeuCau);
      if (!Number.isFinite(qty) || qty < 0 || qty > MAX_QTY) {
        throw new BadRequestException(
          `Số lượng yêu cầu không hợp lệ cho vật tư [${text(item?.maVatTu, 100) || '?'}].`,
        );
      }
    }

    const validItems = rawItems
      .filter((item) => Number(item?.soLuongYeuCau) > 0)
      .map((item) => {
        const slsp = Number(item?.soLuongSanPham);
        return {
          pdmId: toPositiveInt(item?.pdmId),
          soLuongYeuCau: Math.round(Number(item.soLuongYeuCau) * 10000) / 10000,
          soLuongSanPham:
            Number.isFinite(slsp) && slsp >= 0 && slsp <= MAX_QTY ? Math.round(slsp) : 0,
          ghiChu: text(item?.ghiChuLot || item?.ghiChu || dto?.ghiChuLot, 500),
        };
      });

    if (validItems.length === 0) {
      throw new BadRequestException(
        'Danh sách vật tư đặt hàng trống hoặc số lượng yêu cầu bằng 0',
      );
    }
    if (validItems.some((item) => !item.pdmId)) {
      throw new BadRequestException(
        'Danh sách vật tư thiếu mã định mức. Vui lòng tải lại trang và tính lại vật tư trước khi gửi.',
      );
    }
    const pdmIds = validItems.map((item) => item.pdmId as number);
    if (new Set(pdmIds).size !== pdmIds.length) {
      throw new BadRequestException('Danh sách vật tư có dòng định mức bị trùng.');
    }

    let ngayCanGiao: Date | null = null;
    if (dto?.ngayCanGiao) {
      ngayCanGiao = new Date(dto.ngayCanGiao);
      if (Number.isNaN(ngayCanGiao.getTime())) {
        throw new BadRequestException('Ngày cần giao không hợp lệ.');
      }
    }
    const ghiChuLot = text(dto?.ghiChuLot, 500);
    const ghiChu = text(dto?.ghiChu, 500);

    const pool = await this.databaseService.getPool();
    const tx = new sql.Transaction(pool);

    await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      await this.assertQuyen(tx, tkId, 'datHang');
      const nguoiDat = await this.getTenNguoiThaoTac(tx, tkId);

      const lsxRes = await new sql.Request(tx)
        .input('LSXId', sql.BigInt, lsxId)
        .query(`SELECT LSXId FROM dbo.OMM_LenhSanXuat WHERE LSXId = @LSXId`);
      if (!lsxRes.recordset.length) {
        throw new BadRequestException(`Không tìm thấy Lệnh sản xuất #${lsxId}`);
      }

      // Re-read every BOM line from the DB: it must belong to a PO of this LSX, and code,
      // name, unit, định mức and warehouse group come from there, not from the client.
      const bomById = new Map<number, any>();
      for (let i = 0; i < pdmIds.length; i += 500) {
        const chunk = pdmIds.slice(i, i + 500);
        const req = new sql.Request(tx).input('LSXId', sql.BigInt, lsxId);
        const params = chunk.map((id, j) => {
          req.input(`P${j}`, sql.BigInt, id);
          return `@P${j}`;
        });
        const bomRes = await req.query(`
          SELECT
            b.PDMId,
            ISNULL(b.VTId, 0) AS VTId,
            ISNULL(b.Item, N'') AS Item,
            ISNULL(b.MaMau, N'') AS MaMau,
            ISNULL(b.MaChungLoai, N'') AS MaChungLoai,
            ISNULL(b.DienGiai, N'') AS DienGiai,
            ISNULL(b.Size, N'') AS Size,
            ISNULL(b.DVT, N'') AS DVT,
            ISNULL(b.LoaiNPL, N'') AS LoaiNPL,
            COALESCE(NULLIF(b.DinhMuc, 0), NULLIF(b.DinhMucChuan, 0), NULLIF(b.DinhMucKhachHang, 0), 0) AS DinhMucVal
          FROM dbo.OMM_PO_BangDinhMuc b
          WHERE b.PDMId IN (${params.join(', ')})
            AND b.POId IN (SELECT ct.POId FROM dbo.OMM_LenhSanXuat_ChiTiet ct WHERE ct.LSXId = @LSXId)
        `);
        for (const row of bomRes.recordset) bomById.set(Number(row.PDMId), row);
      }
      if (bomById.size !== pdmIds.length) {
        throw new BadRequestException(
          'Có vật tư không thuộc định mức của Lệnh sản xuất này. Vui lòng tải lại trang và tính lại vật tư.',
        );
      }

      const groupsByKho = new Map<LoaiKho, Array<{
        vtId: number;
        maVatTu: string;
        tenVatTu: string;
        dvt: string;
        loaiNPL: string;
        dinhMuc: number;
        soLuongSanPham: number;
        soLuongYeuCau: number;
        ghiChu: string;
      }>>();
      for (const item of validItems) {
        const bom = bomById.get(item.pdmId as number);
        const loaiKho = classifyLoaiKho(bom.LoaiNPL, bom.MaChungLoai);
        const { maVatTu, tenVatTu } = buildMaterialDisplay(bom);
        if (!groupsByKho.has(loaiKho)) groupsByKho.set(loaiKho, []);
        groupsByKho.get(loaiKho)!.push({
          vtId: Number(bom.VTId || 0),
          maVatTu,
          tenVatTu,
          dvt: String(bom.DVT || '').trim(),
          loaiNPL: LOAI_NPL_LABEL[loaiKho],
          dinhMuc: Number(bom.DinhMucVal || 0),
          soLuongSanPham: item.soLuongSanPham,
          soLuongYeuCau: item.soLuongYeuCau,
          ghiChu: item.ghiChu,
        });
      }

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
        insertHeaderReq.input('LSXId', sql.BigInt, lsxId);
        insertHeaderReq.input('Loai', sql.NVarChar(50), loaiKho);
        insertHeaderReq.input('NguoiDat', sql.NVarChar(150), nguoiDat);
        insertHeaderReq.input('TKId', sql.BigInt, tkId);
        insertHeaderReq.input('NgayGiao', sql.DateTime, ngayCanGiao);
        insertHeaderReq.input('Lot', sql.NVarChar(500), ghiChuLot);
        insertHeaderReq.input('GhiChu', sql.NVarChar(500), ghiChu);

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
          detailReq.input('DDHId', sql.BigInt, donDatHangId);
          detailReq.input('VTId', sql.BigInt, item.vtId);
          detailReq.input('MaVT', sql.NVarChar(100), item.maVatTu);
          detailReq.input('TenVT', sql.NVarChar(500), item.tenVatTu);
          detailReq.input('DVT', sql.NVarChar(50), item.dvt);
          detailReq.input('LoaiNPL', sql.NVarChar(100), item.loaiNPL);
          detailReq.input('DM', sql.Float, item.dinhMuc);
          detailReq.input('SLSP', sql.Int, item.soLuongSanPham);
          detailReq.input('SLYC', sql.Float, item.soLuongYeuCau);
          detailReq.input('GhiChu', sql.NVarChar(500), item.ghiChu);

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

      await this.push.enqueueOrders(tx, createdOrders, { lsxId, nguoiDat });
      await tx.commit();

      const lastOrder = createdOrders[createdOrders.length - 1];
      return {
        donDatHangId: lastOrder.donDatHangId,
        soDonDatHang: createdOrders.map((o) => o.soDonDatHang).join(', '),
        lsxId,
        loaiDatHang: lastOrder.loaiDatHang,
        trangThai: 'ChoSoanHang',
        soMatHang: validItems.length,
        nguoiDat,
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
    search?: string;
    tuNgay?: string;
    denNgay?: string;
  }): Promise<any[]> {
    const pool = await this.databaseService.getPool();
    const req = pool.request();
    req.input('LSXId', sql.BigInt, params.lsxId ? Number(params.lsxId) : null);
    req.input(
      'LoaiDatHang',
      sql.NVarChar(50),
      params.loaiDatHang && params.loaiDatHang !== 'ALL'
        ? params.loaiDatHang
        : null,
    );
    req.input(
      'TrangThai',
      sql.NVarChar(50),
      params.trangThai && params.trangThai !== 'ALL'
        ? params.trangThai
        : null,
    );
    req.input(
      'TuNgay',
      sql.DateTime,
      params.tuNgay ? new Date(params.tuNgay) : null,
    );
    req.input(
      'DenNgay',
      sql.DateTime,
      params.denNgay ? new Date(`${params.denNgay}T23:59:59`) : null,
    );
    req.input(
      'Search',
      sql.NVarChar(100),
      params.search && params.search.trim() !== ''
        ? `%${params.search.trim()}%`
        : null,
    );

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
        AND (@TuNgay IS NULL OR d.NgayDat >= @TuNgay)
        AND (@DenNgay IS NULL OR d.NgayDat <= @DenNgay)
        AND (
          @Search IS NULL
          OR d.SoDonDatHang LIKE @Search
          OR lsx.SoLSX LIKE @Search
          OR lsx.MaHang LIKE @Search
          OR lsx.KhachHang LIKE @Search
          OR d.NguoiDat LIKE @Search
          OR psh.MaSoPhieuSoan LIKE @Search
        )
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

  async huyDonDatHangLSX(donDatHangId: number, tkId: number): Promise<any> {
    if (!toPositiveInt(donDatHangId)) {
      throw new BadRequestException('Mã đơn đặt hàng không hợp lệ');
    }

    const pool = await this.databaseService.getPool();
    const tx = new sql.Transaction(pool);

    await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      await this.assertQuyen(tx, tkId, 'huyDon');
      const nguoiHuy = await this.getTenNguoiThaoTac(tx, tkId);

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

      // Who cancelled: written once database/20261121_DonDatHangLSX_NguoiHuy.sql has added the columns.
      await new sql.Request(tx)
        .input('DonDatHangId', sql.BigInt, Number(donDatHangId))
        .input('TKIdHuy', sql.BigInt, tkId)
        .input('NguoiHuy', sql.NVarChar(150), nguoiHuy)
        .query(`
          IF COL_LENGTH('dbo.OMM_DonDatHang_LSX', 'NguoiHuy') IS NOT NULL
            EXEC sp_executesql
              N'UPDATE dbo.OMM_DonDatHang_LSX
                SET NguoiHuy = @NguoiHuy, TKIdHuy = @TKIdHuy, NgayHuy = GETDATE()
                WHERE DonDatHangId = @DonDatHangId',
              N'@NguoiHuy nvarchar(150), @TKIdHuy bigint, @DonDatHangId bigint',
              @NguoiHuy = @NguoiHuy, @TKIdHuy = @TKIdHuy, @DonDatHangId = @DonDatHangId;
        `);

      await tx.commit();

      return {
        donDatHangId: Number(donDatHangId),
        soDonDatHang: soDDH,
        trangThai: 'DaHuy',
        nguoiHuy,
      };
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async taoPhieuSoanHangTuDonDatHang(donDatHangId: number, tkId: number): Promise<any> {
    if (!toPositiveInt(donDatHangId)) {
      throw new BadRequestException('Mã đơn đặt hàng không hợp lệ');
    }

    const pool = await this.databaseService.getPool();
    const tx = new sql.Transaction(pool);

    await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      const nguoiTao = await this.getTenNguoiThaoTac(tx, tkId);

      const checkRes = await new sql.Request(tx)
        .input('DonDatHangId', sql.BigInt, Number(donDatHangId))
        .query(`
          SELECT 
            d.DonDatHangId,
            d.SoDonDatHang,
            d.LoaiDatHang,
            d.NgayCanGiao,
            d.GhiChuLot,
            d.GhiChu,
            d.TrangThai,
            d.PhieuSoanHangId,
            psh.TinhTrang AS TinhTrangPSH,
            psh.MaSoPhieuSoan
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

      const ddh = checkRes.recordset[0];
      const soDDH = String(ddh.SoDonDatHang || '');
      const loaiDatHang = String(ddh.LoaiDatHang || '');
      const trangThaiDDH = String(ddh.TrangThai || '').trim();
      const existingPshId = ddh.PhieuSoanHangId
        ? Number(ddh.PhieuSoanHangId)
        : null;
      const tinhTrangPSH = String(ddh.TinhTrangPSH || '')
        .trim()
        .toLowerCase();
      const maSoPSHCu = String(ddh.MaSoPhieuSoan || '');

      if (trangThaiDDH.toLowerCase() === 'dahuy') {
        throw new BadRequestException(
          `Đơn đặt hàng [${soDDH}] đã bị hủy, không thể tạo Phiếu Soạn Hàng.`,
        );
      }

      if (existingPshId && existingPshId > 0 && tinhTrangPSH !== 'huy') {
        throw new BadRequestException(
          `Đơn đặt hàng này đã được tạo Phiếu Soạn Hàng trước đó (Số phiếu: ${maSoPSHCu}).`,
        );
      }

      const prefixKho = loaiDatHang === 'NguyenLieu' ? 'NA' : 'PA';
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `${prefixKho}${yy}${mm}`;

      const countRes = await new sql.Request(tx)
        .input('Prefix', sql.NVarChar(30), `${prefix}%`)
        .query(`
          SELECT ISNULL(MAX(TRY_CAST(RIGHT(MaSoPhieuSoan, 4) AS INT)), 0) AS MaxCount
          FROM dbo.WH_PhieuSoanHang WITH (UPDLOCK, HOLDLOCK)
          WHERE MaSoPhieuSoan LIKE @Prefix
        `);

      const nextCount = Number(countRes.recordset[0]?.MaxCount ?? 0) + 1;
      const maPSH = `${prefix}${String(nextCount).padStart(4, '0')}`;

      const ngaySoan = ddh.NgayCanGiao ? new Date(ddh.NgayCanGiao) : now;
      const pshGhiChu =
        `LSX: Đặt hàng ${loaiDatHang}. ${ddh.GhiChuLot || ''} ${ddh.GhiChu || ''}`.trim();

      const insertPshRes = await new sql.Request(tx)
        .input('MaSoPhieuSoan', sql.NVarChar(50), maPSH)
        .input('NgaySoan', sql.DateTime, ngaySoan)
        .input('NguoiTao', sql.BigInt, tkId ? Number(tkId) : null)
        .input('TenNguoiTao', sql.NVarChar(500), nguoiTao || '')
        .input('TKId', sql.BigInt, tkId ? Number(tkId) : null)
        .input('LenhId', sql.BigInt, Number(donDatHangId))
        .query(`
          INSERT INTO dbo.WH_PhieuSoanHang (
            MaSoPhieuSoan, NgayTao, NgaySoan, TinhTrang, NguoiTao, TenNguoiTao, TKId,
            LoaiLenh, LenhId
          ) VALUES (
            @MaSoPhieuSoan, GETDATE(), @NgaySoan, 'moitao', @NguoiTao, @TenNguoiTao, @TKId,
            'DonDatHang', @LenhId
          );
          SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS PhieuSoanHangId;
        `);

      const newPshId = Number(insertPshRes.recordset[0].PhieuSoanHangId);

      await new sql.Request(tx)
        .input('PSHId', sql.BigInt, newPshId)
        .input('DonDatHangId', sql.BigInt, Number(donDatHangId))
        .query(`
          INSERT INTO dbo.WH_ChiTietPhieuSoanHang (
            PhieuSoanHangId, ChiTietLenhId, ChiTietDonDatHangId, VTId, MaChungLoai, Item, MaMau, DVT,
            QuyCach, LoaiNPL, DienGiai, LOT, SoLuongYeuCau, SoLuongThucSoan, TieuHao1
          )
          SELECT 
            @PSHId, ct.CTDonDatHangId, ct.CTDonDatHangId, ISNULL(ct.VTId, 0), '', LEFT(ISNULL(ct.MaVatTu, ''), 50), '', ct.DVT,
            ct.GhiChu, ct.LoaiNPL, ct.TenVatTu, d.GhiChuLot, ct.SoLuongYeuCau, 0, ct.SoLuongYeuCau
          FROM dbo.OMM_DonDatHang_LSX_ChiTiet ct
          JOIN dbo.OMM_DonDatHang_LSX d ON d.DonDatHangId = ct.DonDatHangId
          WHERE ct.DonDatHangId = @DonDatHangId;
        `);

      await new sql.Request(tx)
        .input('PSHId', sql.BigInt, newPshId)
        .input('DonDatHangId', sql.BigInt, Number(donDatHangId))
        .query(`
          UPDATE dbo.OMM_DonDatHang_LSX
          SET PhieuSoanHangId = @PSHId, TrangThai = 'DaTaoPSH'
          WHERE DonDatHangId = @DonDatHangId;
        `);

      await tx.commit();

      return {
        donDatHangId: Number(donDatHangId),
        soDonDatHang: soDDH,
        phieuSoanHangId: newPshId,
        maSoPhieuSoan: maPSH,
        trangThai: 'DaTaoPSH',
      };
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }
}
