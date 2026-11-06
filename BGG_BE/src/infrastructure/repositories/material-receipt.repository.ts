import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import sql from 'mssql';
import { DatabaseService } from '../database/database.service.js';
import {
  MaterialReceiptOrderEntity,
  MaterialReceiptItemEntity,
  MaterialReceiptRollEntity,
} from '../../domain/entities/material-receipt.entity.js';
import { IMaterialReceiptRepository } from '../../domain/repositories/material-receipt.repository.interface.js';
import {
  wh_DanhSachDonNhanHang_RequestDTO,
  wh_QuetNhanCay_RequestDTO,
  wh_XacNhanNhanHang_RequestDTO,
} from '../../application/dtos/material-receipt-request.dto.js';

@Injectable()
export class MaterialReceiptRepository implements IMaterialReceiptRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getDanhSachDonNhanHang(
    dto: wh_DanhSachDonNhanHang_RequestDTO,
  ): Promise<MaterialReceiptOrderEntity[]> {
    const pool = await this.databaseService.getPool();

    let whereSql = `WHERE rolls.TongSoCay > 0`;

    // Lọc theo Loại đặt hàng
    if (dto.loaiDatHang && dto.loaiDatHang !== 'ALL') {
      if (dto.loaiDatHang === 'NguyenLieu') {
        whereSql += ` AND (d.LoaiDatHang = 'NguyenLieu' OR (d.LoaiDatHang IS NULL AND psh.MaSoPhieuSoan LIKE 'NA%'))`;
      } else if (dto.loaiDatHang === 'PhuLieu') {
        whereSql += ` AND (d.LoaiDatHang = 'PhuLieu' OR (d.LoaiDatHang IS NULL AND psh.MaSoPhieuSoan LIKE 'PA%'))`;
      }
    }

    // Lọc theo Trạng thái nhận
    if (dto.trangThai && dto.trangThai !== 'ALL') {
      if (dto.trangThai === 'ChoNhan') {
        whereSql += ` AND ISNULL(rolls.SoCayDaNhan, 0) = 0`;
      } else if (dto.trangThai === 'NhanMotPhan') {
        whereSql += ` AND ISNULL(rolls.SoCayDaNhan, 0) > 0 AND rolls.SoCayDaNhan < rolls.TongSoCay`;
      } else if (dto.trangThai === 'DaNhanDu') {
        whereSql += ` AND rolls.SoCayDaNhan >= rolls.TongSoCay`;
      }
    }

    // Lọc theo Ngày soạn / Ngày xuất
    if (dto.tuNgay) {
      whereSql += ` AND CAST(ISNULL(psh.NgaySoan, psh.NgayTao) AS DATE) >= @tuNgay`;
    }
    if (dto.denNgay) {
      whereSql += ` AND CAST(ISNULL(psh.NgaySoan, psh.NgayTao) AS DATE) <= @denNgay`;
    }

    // Lọc từ khóa tìm kiếm
    if (dto.keyword && dto.keyword.trim()) {
      whereSql += ` AND (
        d.SoDonDatHang LIKE @keyword
        OR psh.MaSoPhieuSoan LIKE @keyword
        OR lsx.SoLSX LIKE @keyword
        OR lsx.MaHang LIKE @keyword
        OR lsx.NhaCat LIKE @keyword
        OR lsx.ToMay LIKE @keyword
      )`;
    }

    const req = pool.request();
    if (dto.tuNgay) req.input('tuNgay', sql.Date, new Date(dto.tuNgay));
    if (dto.denNgay) req.input('denNgay', sql.Date, new Date(dto.denNgay));
    if (dto.keyword && dto.keyword.trim()) {
      req.input('keyword', sql.NVarChar(100), `%${dto.keyword.trim()}%`);
    }

    const query = `
      SELECT 
        psh.PhieuSoanHangId,
        psh.MaSoPhieuSoan,
        psh.NgaySoan,
        psh.NgayTao,
        psh.TinhTrang AS TinhTrangPSH,
        psh.LoaiLenh,
        psh.LenhId,
        psh.TenNguoiTao AS NguoiXuat,
        psh.ThoiGianXacNhanXuat AS NgayXuat,
        d.DonDatHangId,
        d.SoDonDatHang,
        d.LoaiDatHang,
        d.TrangThai AS TrangThaiDDH,
        lsx.SoLSX,
        lsx.MaHang,
        lsx.NhaCat,
        lsx.ToMay,
        CASE 
          WHEN d.LoaiDatHang = 'NguyenLieu' THEN N'Nhà cắt ' + ISNULL(lsx.NhaCat, N'')
          WHEN d.LoaiDatHang = 'PhuLieu' THEN N'Tổ may ' + ISNULL(lsx.ToMay, N'')
          WHEN psh.MaSoPhieuSoan LIKE 'NA%' THEN N'Nhà cắt'
          WHEN psh.MaSoPhieuSoan LIKE 'PA%' THEN N'Tổ may'
          ELSE N'Bộ phận sản xuất'
        END AS BoPhanNhan,
        rolls.TongSoCay,
        rolls.TongSoLuongXuat,
        rolls.SoCayDaNhan,
        rolls.SoLuongDaNhan,
        CASE 
          WHEN ISNULL(rolls.SoCayDaNhan, 0) = 0 THEN 'ChoNhan'
          WHEN rolls.SoCayDaNhan < rolls.TongSoCay THEN 'NhanMotPhan'
          ELSE 'DaNhanDu'
        END AS TrangThaiNhan,
        CASE 
          WHEN ISNULL(rolls.TongSoCay, 0) = 0 THEN 0
          ELSE ROUND(CAST(rolls.SoCayDaNhan AS FLOAT) * 100.0 / CAST(rolls.TongSoCay AS FLOAT), 1)
        END AS TiLeNhan,
        rolls.ThoiGianNhanMoiNhat,
        rolls.NguoiNhanMoiNhat
      FROM dbo.WH_PhieuSoanHang psh
      CROSS APPLY (
        SELECT 
          COUNT(c.CayId) AS TongSoCay,
          SUM(ISNULL(c.SoLuong, 0)) AS TongSoLuongXuat,
          SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN 1 ELSE 0 END) AS SoCayDaNhan,
          SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN ISNULL(c.SoLuongThucNhan, c.SoLuong) ELSE 0 END) AS SoLuongDaNhan,
          MAX(c.ThoiGianXacNhan) AS ThoiGianNhanMoiNhat,
          MAX(c.TenNguoiXacNhan) AS NguoiNhanMoiNhat
        FROM dbo.WH_ChiTietPhieuSoanHang s
        INNER JOIN dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c ON c.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
        WHERE s.PhieuSoanHangId = psh.PhieuSoanHangId
      ) rolls
      LEFT JOIN dbo.OMM_DonDatHang_LSX d ON (psh.LoaiLenh = 'DonDatHang' AND psh.LenhId = d.DonDatHangId) OR (d.PhieuSoanHangId = psh.PhieuSoanHangId)
      LEFT JOIN dbo.OMM_LenhSanXuat lsx ON d.LSXId = lsx.LSXId
      ${whereSql}
      ORDER BY psh.PhieuSoanHangId DESC
    `;

    const result = await req.query(query);
    return result.recordset || [];
  }

  async getChiTietDonNhanHang(
    phieuSoanHangId: number,
    donDatHangId?: number,
  ): Promise<{
    header: MaterialReceiptOrderEntity;
    items: MaterialReceiptItemEntity[];
  }> {
    const pool = await this.databaseService.getPool();

    // 1. Lấy Header
    const headerReq = pool.request();
    headerReq.input('id', sql.BigInt, phieuSoanHangId);
    const headerQuery = `
      SELECT 
        psh.PhieuSoanHangId,
        psh.MaSoPhieuSoan,
        psh.NgaySoan,
        psh.NgayTao,
        psh.TinhTrang AS TinhTrangPSH,
        psh.LoaiLenh,
        psh.LenhId,
        psh.TenNguoiTao AS NguoiXuat,
        psh.ThoiGianXacNhanXuat AS NgayXuat,
        d.DonDatHangId,
        d.SoDonDatHang,
        d.LoaiDatHang,
        d.TrangThai AS TrangThaiDDH,
        lsx.SoLSX,
        lsx.MaHang,
        lsx.NhaCat,
        lsx.ToMay,
        CASE 
          WHEN d.LoaiDatHang = 'NguyenLieu' THEN N'Nhà cắt ' + ISNULL(lsx.NhaCat, N'')
          WHEN d.LoaiDatHang = 'PhuLieu' THEN N'Tổ may ' + ISNULL(lsx.ToMay, N'')
          WHEN psh.MaSoPhieuSoan LIKE 'NA%' THEN N'Nhà cắt'
          WHEN psh.MaSoPhieuSoan LIKE 'PA%' THEN N'Tổ may'
          ELSE N'Bộ phận sản xuất'
        END AS BoPhanNhan,
        rolls.TongSoCay,
        rolls.TongSoLuongXuat,
        rolls.SoCayDaNhan,
        rolls.SoLuongDaNhan,
        CASE 
          WHEN ISNULL(rolls.SoCayDaNhan, 0) = 0 THEN 'ChoNhan'
          WHEN rolls.SoCayDaNhan < rolls.TongSoCay THEN 'NhanMotPhan'
          ELSE 'DaNhanDu'
        END AS TrangThaiNhan,
        CASE 
          WHEN ISNULL(rolls.TongSoCay, 0) = 0 THEN 0
          ELSE ROUND(CAST(rolls.SoCayDaNhan AS FLOAT) * 100.0 / CAST(rolls.TongSoCay AS FLOAT), 1)
        END AS TiLeNhan,
        rolls.ThoiGianNhanMoiNhat,
        rolls.NguoiNhanMoiNhat
      FROM dbo.WH_PhieuSoanHang psh
      CROSS APPLY (
        SELECT 
          COUNT(c.CayId) AS TongSoCay,
          SUM(ISNULL(c.SoLuong, 0)) AS TongSoLuongXuat,
          SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN 1 ELSE 0 END) AS SoCayDaNhan,
          SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN ISNULL(c.SoLuongThucNhan, c.SoLuong) ELSE 0 END) AS SoLuongDaNhan,
          MAX(c.ThoiGianXacNhan) AS ThoiGianNhanMoiNhat,
          MAX(c.TenNguoiXacNhan) AS NguoiNhanMoiNhat
        FROM dbo.WH_ChiTietPhieuSoanHang s
        INNER JOIN dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c ON c.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
        WHERE s.PhieuSoanHangId = psh.PhieuSoanHangId
      ) rolls
      LEFT JOIN dbo.OMM_DonDatHang_LSX d ON (psh.LoaiLenh = 'DonDatHang' AND psh.LenhId = d.DonDatHangId) OR (d.PhieuSoanHangId = psh.PhieuSoanHangId)
      LEFT JOIN dbo.OMM_LenhSanXuat lsx ON d.LSXId = lsx.LSXId
      WHERE psh.PhieuSoanHangId = @id
    `;
    const headerRes = await headerReq.query(headerQuery);
    if (!headerRes.recordset || headerRes.recordset.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy phiếu soạn hàng #${phieuSoanHangId}`,
      );
    }
    const header: MaterialReceiptOrderEntity = headerRes.recordset[0];

    // 2. Lấy danh sách chi tiết vật tư & cây đã xuất
    const detailReq = pool.request();
    detailReq.input('id', sql.BigInt, phieuSoanHangId);
    const detailQuery = `
      SELECT 
        s.ChiTietPhieuSoanHangId,
        s.PhieuSoanHangId,
        s.Item AS MaVatTu,
        s.DienGiai AS TenVatTu,
        s.MaMau,
        s.QuyCach,
        s.DVT,
        s.SoLuongYeuCau,
        s.SoLuongThucSoan,
        c.CayId,
        c.MaCay,
        c.MaCayMoi,
        c.SoLuong AS SoLuongXuat,
        ISNULL(c.isXacNhan, 0) AS isXacNhan,
        c.SoLuongThucNhan,
        c.ThoiGianXacNhan,
        c.TKId,
        c.NguoiXacNhan,
        c.TenNguoiXacNhan,
        c.XiNghiepXacNhan,
        c.ThoiGianQuetXuat,
        c.TenNguoiQuetXuat
      FROM dbo.WH_ChiTietPhieuSoanHang s
      LEFT JOIN dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c ON c.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
      WHERE s.PhieuSoanHangId = @id
      ORDER BY s.ChiTietPhieuSoanHangId, c.MaCay
    `;
    const detailRes = await detailReq.query(detailQuery);
    const rows = detailRes.recordset || [];

    // Group rows by ChiTietPhieuSoanHangId
    const itemsMap = new Map<number, MaterialReceiptItemEntity>();

    for (const row of rows) {
      const ctId = Number(row.ChiTietPhieuSoanHangId);
      if (!itemsMap.has(ctId)) {
        itemsMap.set(ctId, {
          ChiTietPhieuSoanHangId: ctId,
          PhieuSoanHangId: Number(row.PhieuSoanHangId),
          MaVatTu: row.MaVatTu || '',
          TenVatTu: row.TenVatTu || '',
          MaMau: row.MaMau || '',
          QuyCach: row.QuyCach || '',
          DVT: row.DVT || '',
          SoLuongYeuCau: Number(row.SoLuongYeuCau) || 0,
          SoLuongThucSoan: Number(row.SoLuongThucSoan) || 0,
          SoCay: 0,
          SoCayDaNhan: 0,
          SoLuongDaNhan: 0,
          cays: [],
        });
      }

      const item = itemsMap.get(ctId)!;

      if (row.MaCay) {
        const isReceived = Boolean(row.isXacNhan);
        const slXuat = Number(row.SoLuongXuat) || 0;
        const slThucNhan =
          row.SoLuongThucNhan !== null && row.SoLuongThucNhan !== undefined
            ? Number(row.SoLuongThucNhan)
            : isReceived
              ? slXuat
              : 0;

        item.SoCay += 1;
        if (isReceived) {
          item.SoCayDaNhan += 1;
          item.SoLuongDaNhan += slThucNhan;
        }

        item.cays.push({
          ChiTietPhieuSoanHangId: ctId,
          CayId: Number(row.CayId) || 0,
          MaCay: row.MaCay,
          MaCayMoi: row.MaCayMoi || '',
          SoLuongXuat: slXuat,
          isXacNhan: isReceived,
          SoLuongThucNhan: isReceived ? slThucNhan : undefined,
          ThoiGianXacNhan: row.ThoiGianXacNhan || undefined,
          TKId: row.TKId ? Number(row.TKId) : undefined,
          NguoiXacNhan: row.NguoiXacNhan ? Number(row.NguoiXacNhan) : undefined,
          TenNguoiXacNhan: row.TenNguoiXacNhan || undefined,
          XiNghiepXacNhan: row.XiNghiepXacNhan || undefined,
          ThoiGianQuetXuat: row.ThoiGianQuetXuat || undefined,
          TenNguoiQuetXuat: row.TenNguoiQuetXuat || undefined,
        });
      }
    }

    return {
      header,
      items: Array.from(itemsMap.values()),
    };
  }

  async quetNhanCay(dto: wh_QuetNhanCay_RequestDTO): Promise<{
    cay: MaterialReceiptRollEntity;
    summary: {
      TongSoCay: number;
      SoCayDaNhan: number;
      TongSoLuongXuat: number;
      SoLuongDaNhan: number;
      TrangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu';
      TiLeNhan: number;
      isHoanThanh: boolean;
    };
  }> {
    const pool = await this.databaseService.getPool();
    const barcode = (dto.MaCay || '').trim();

    if (!barcode) {
      throw new BadRequestException('Mã vạch cây không được để trống!');
    }

    // 1. Tìm cây trong phiếu soạn
    const findReq = pool.request();
    findReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
    findReq.input('barcode', sql.NVarChar(100), barcode);
    const findRes = await findReq.query(`
      SELECT 
        c.ChiTietPhieuSoanHangId,
        c.CayId,
        c.MaCay,
        c.MaCayMoi,
        c.SoLuong AS SoLuongXuat,
        ISNULL(c.isXacNhan, 0) AS isXacNhan,
        c.SoLuongThucNhan,
        c.ThoiGianXacNhan,
        c.TKId,
        c.NguoiXacNhan,
        c.TenNguoiXacNhan,
        c.XiNghiepXacNhan,
        s.Item AS MaVatTu,
        s.DienGiai AS TenVatTu
      FROM dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c
      INNER JOIN dbo.WH_ChiTietPhieuSoanHang s ON s.ChiTietPhieuSoanHangId = c.ChiTietPhieuSoanHangId
      WHERE s.PhieuSoanHangId = @id
        AND (UPPER(LTRIM(RTRIM(c.MaCay))) = UPPER(@barcode) OR UPPER(LTRIM(RTRIM(c.MaCayMoi))) = UPPER(@barcode))
    `);

    if (!findRes.recordset || findRes.recordset.length === 0) {
      // Kiểm tra xem mã cây có nằm trong phiếu soạn khác không
      const otherReq = pool.request();
      otherReq.input('barcode', sql.NVarChar(100), barcode);
      const otherRes = await otherReq.query(`
        SELECT TOP 1 psh.MaSoPhieuSoan, psh.PhieuSoanHangId
        FROM dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c
        INNER JOIN dbo.WH_ChiTietPhieuSoanHang s ON s.ChiTietPhieuSoanHangId = c.ChiTietPhieuSoanHangId
        INNER JOIN dbo.WH_PhieuSoanHang psh ON psh.PhieuSoanHangId = s.PhieuSoanHangId
        WHERE UPPER(LTRIM(RTRIM(c.MaCay))) = UPPER(@barcode) OR UPPER(LTRIM(RTRIM(c.MaCayMoi))) = UPPER(@barcode)
      `);

      if (otherRes.recordset && otherRes.recordset.length > 0) {
        throw new BadRequestException(
          `Cây [${barcode}] không thuộc phiếu soạn này! Cây này thuộc phiếu soạn [${otherRes.recordset[0].MaSoPhieuSoan}].`,
        );
      } else {
        throw new BadRequestException(
          `Mã cây [${barcode}] không tồn tại trong hệ thống xuất kho hoặc chưa được kho quét xuất!`,
        );
      }
    }

    const matchedRow = findRes.recordset[0];
    const ctId = Number(matchedRow.ChiTietPhieuSoanHangId);
    const cayId = Number(matchedRow.CayId);
    const maCayExact = matchedRow.MaCay;
    const isHuyNhan = dto.action === 'huy_nhan';

    // 2. Thực hiện cập nhật
    const updateReq = pool.request();
    updateReq.input('ctId', sql.BigInt, ctId);
    updateReq.input('cayId', sql.BigInt, cayId);
    updateReq.input('maCay', sql.NVarChar(100), maCayExact);

    if (isHuyNhan) {
      // Hủy nhận
      await updateReq.query(`
        UPDATE dbo.WH_ChiTietPhieuSoanHang_ChiTietCay
        SET isXacNhan = 0,
            SoLuongThucNhan = NULL,
            ThoiGianXacNhan = NULL,
            TKId = NULL,
            NguoiXacNhan = NULL,
            TenNguoiXacNhan = NULL,
            XiNghiepXacNhan = NULL
        WHERE ChiTietPhieuSoanHangId = @ctId AND CayId = @cayId AND MaCay = @maCay;
      `);
    } else {
      // Xác nhận nhận
      const slNhan =
        dto.SoLuongThucNhan !== undefined && dto.SoLuongThucNhan !== null
          ? Number(dto.SoLuongThucNhan)
          : Number(matchedRow.SoLuongXuat);

      updateReq.input('slNhan', sql.Float, slNhan);
      updateReq.input('tkId', sql.BigInt, dto.tkId);
      updateReq.input('tenNguoiNhan', sql.NVarChar(200), dto.tenNguoiNhan);
      updateReq.input(
        'xiNghiepNhan',
        sql.NVarChar(200),
        dto.xiNghiepNhan || null,
      );

      await updateReq.query(`
        UPDATE dbo.WH_ChiTietPhieuSoanHang_ChiTietCay
        SET isXacNhan = 1,
            SoLuongThucNhan = @slNhan,
            ThoiGianXacNhan = GETDATE(),
            TKId = @tkId,
            NguoiXacNhan = @tkId,
            TenNguoiXacNhan = @tenNguoiNhan,
            XiNghiepXacNhan = @xiNghiepNhan
        WHERE ChiTietPhieuSoanHangId = @ctId AND CayId = @cayId AND MaCay = @maCay;
      `);
    }

    // 3. Tính toán lại summary
    const summaryReq = pool.request();
    summaryReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
    const summaryRes = await summaryReq.query(`
      SELECT 
        COUNT(c.CayId) AS TongSoCay,
        SUM(ISNULL(c.SoLuong, 0)) AS TongSoLuongXuat,
        SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN 1 ELSE 0 END) AS SoCayDaNhan,
        SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN ISNULL(c.SoLuongThucNhan, c.SoLuong) ELSE 0 END) AS SoLuongDaNhan
      FROM dbo.WH_ChiTietPhieuSoanHang s
      INNER JOIN dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c ON c.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
      WHERE s.PhieuSoanHangId = @id
    `);

    const sRow = summaryRes.recordset?.[0] || {};
    const tongSoCay = Number(sRow.TongSoCay) || 0;
    const soCayDaNhan = Number(sRow.SoCayDaNhan) || 0;
    const tongSoLuongXuat = Number(sRow.TongSoLuongXuat) || 0;
    const soLuongDaNhan = Number(sRow.SoLuongDaNhan) || 0;

    let trangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu' = 'ChoNhan';
    if (soCayDaNhan === 0) trangThaiNhan = 'ChoNhan';
    else if (soCayDaNhan < tongSoCay) trangThaiNhan = 'NhanMotPhan';
    else trangThaiNhan = 'DaNhanDu';

    const tiLeNhan =
      tongSoCay > 0 ? Math.round((soCayDaNhan / tongSoCay) * 1000) / 10 : 0;
    const isHoanThanh = tongSoCay > 0 && soCayDaNhan >= tongSoCay;

    // 4. Nếu đã nhận đủ toàn bộ phiếu, cập nhật trạng thái đơn đặt hàng LSX
    if (isHoanThanh && !isHuyNhan) {
      const ddhReq = pool.request();
      ddhReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
      await ddhReq.query(`
        UPDATE d
        SET TrangThai = 'DaNhanHang'
        FROM dbo.OMM_DonDatHang_LSX d
        INNER JOIN dbo.WH_PhieuSoanHang psh ON (psh.LoaiLenh = 'DonDatHang' AND psh.LenhId = d.DonDatHangId) OR (d.PhieuSoanHangId = psh.PhieuSoanHangId)
        WHERE psh.PhieuSoanHangId = @id;
      `);
    } else if (isHuyNhan && trangThaiNhan !== 'DaNhanDu') {
      // Nếu vừa hủy nhận và không còn đủ, đưa lại trạng thái 'HoanThanh' (hoặc 'DaTaoPSH')
      const revertReq = pool.request();
      revertReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
      await revertReq.query(`
        UPDATE d
        SET TrangThai = 'HoanThanh'
        FROM dbo.OMM_DonDatHang_LSX d
        INNER JOIN dbo.WH_PhieuSoanHang psh ON (psh.LoaiLenh = 'DonDatHang' AND psh.LenhId = d.DonDatHangId) OR (d.PhieuSoanHangId = psh.PhieuSoanHangId)
        WHERE psh.PhieuSoanHangId = @id AND d.TrangThai = 'DaNhanHang';
      `);
    }

    return {
      cay: {
        ChiTietPhieuSoanHangId: ctId,
        CayId: cayId,
        MaCay: maCayExact,
        MaCayMoi: matchedRow.MaCayMoi,
        SoLuongXuat: Number(matchedRow.SoLuongXuat),
        isXacNhan: !isHuyNhan,
        SoLuongThucNhan: !isHuyNhan
          ? dto.SoLuongThucNhan || Number(matchedRow.SoLuongXuat)
          : undefined,
        ThoiGianXacNhan: !isHuyNhan ? new Date() : undefined,
        TenNguoiXacNhan: !isHuyNhan ? dto.tenNguoiNhan : undefined,
        XiNghiepXacNhan: !isHuyNhan ? dto.xiNghiepNhan : undefined,
      },
      summary: {
        TongSoCay: tongSoCay,
        SoCayDaNhan: soCayDaNhan,
        TongSoLuongXuat: tongSoLuongXuat,
        SoLuongDaNhan: soLuongDaNhan,
        TrangThaiNhan: trangThaiNhan,
        TiLeNhan: tiLeNhan,
        isHoanThanh,
      },
    };
  }

  async xacNhanNhanHang(dto: wh_XacNhanNhanHang_RequestDTO): Promise<{
    PhieuSoanHangId: number;
    TongSoCay: number;
    SoCayDaNhan: number;
    TongSoLuongXuat: number;
    SoLuongDaNhan: number;
    TrangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu';
    isHoanThanh: boolean;
    soCayVuaCapNhat: number;
  }> {
    const pool = await this.databaseService.getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      let soCayVuaCapNhat = 0;

      if (dto.nhanTatCa) {
        // Nhận tất cả các cây chưa được nhận
        const batchReq = new sql.Request(transaction);
        batchReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
        batchReq.input('tkId', sql.BigInt, dto.tkId);
        batchReq.input('tenNguoiNhan', sql.NVarChar(200), dto.tenNguoiNhan);
        batchReq.input(
          'xiNghiepNhan',
          sql.NVarChar(200),
          dto.xiNghiepNhan || null,
        );

        const updateRes = await batchReq.query(`
          UPDATE c
          SET isXacNhan = 1,
              SoLuongThucNhan = ISNULL(c.SoLuongThucNhan, c.SoLuong),
              ThoiGianXacNhan = GETDATE(),
              TKId = @tkId,
              NguoiXacNhan = @tkId,
              TenNguoiXacNhan = @tenNguoiNhan,
              XiNghiepXacNhan = @xiNghiepNhan
          FROM dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c
          INNER JOIN dbo.WH_ChiTietPhieuSoanHang s ON s.ChiTietPhieuSoanHangId = c.ChiTietPhieuSoanHangId
          WHERE s.PhieuSoanHangId = @id
            AND ISNULL(c.isXacNhan, 0) = 0;
        `);

        soCayVuaCapNhat = updateRes.rowsAffected?.[0] || 0;
      }

      // Tính tổng kết
      const summaryReq = new sql.Request(transaction);
      summaryReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
      const summaryRes = await summaryReq.query(`
        SELECT 
          COUNT(c.CayId) AS TongSoCay,
          SUM(ISNULL(c.SoLuong, 0)) AS TongSoLuongXuat,
          SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN 1 ELSE 0 END) AS SoCayDaNhan,
          SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN ISNULL(c.SoLuongThucNhan, c.SoLuong) ELSE 0 END) AS SoLuongDaNhan
        FROM dbo.WH_ChiTietPhieuSoanHang s
        INNER JOIN dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c ON c.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
        WHERE s.PhieuSoanHangId = @id
      `);

      const sRow = summaryRes.recordset?.[0] || {};
      const tongSoCay = Number(sRow.TongSoCay) || 0;
      const soCayDaNhan = Number(sRow.SoCayDaNhan) || 0;
      const tongSoLuongXuat = Number(sRow.TongSoLuongXuat) || 0;
      const soLuongDaNhan = Number(sRow.SoLuongDaNhan) || 0;

      let trangThaiNhan: 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu' = 'ChoNhan';
      if (soCayDaNhan === 0) trangThaiNhan = 'ChoNhan';
      else if (soCayDaNhan < tongSoCay) trangThaiNhan = 'NhanMotPhan';
      else trangThaiNhan = 'DaNhanDu';

      const isHoanThanh =
        dto.chotHoanTat || (tongSoCay > 0 && soCayDaNhan >= tongSoCay);

      if (isHoanThanh) {
        const ddhReq = new sql.Request(transaction);
        ddhReq.input('id', sql.BigInt, dto.PhieuSoanHangId);
        await ddhReq.query(`
          UPDATE d
          SET TrangThai = 'DaNhanHang'
          FROM dbo.OMM_DonDatHang_LSX d
          INNER JOIN dbo.WH_PhieuSoanHang psh ON (psh.LoaiLenh = 'DonDatHang' AND psh.LenhId = d.DonDatHangId) OR (d.PhieuSoanHangId = psh.PhieuSoanHangId)
          WHERE psh.PhieuSoanHangId = @id;
        `);
      }

      await transaction.commit();

      return {
        PhieuSoanHangId: dto.PhieuSoanHangId,
        TongSoCay: tongSoCay,
        SoCayDaNhan: soCayDaNhan,
        TongSoLuongXuat: tongSoLuongXuat,
        SoLuongDaNhan: soLuongDaNhan,
        TrangThaiNhan: trangThaiNhan,
        isHoanThanh,
        soCayVuaCapNhat,
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
