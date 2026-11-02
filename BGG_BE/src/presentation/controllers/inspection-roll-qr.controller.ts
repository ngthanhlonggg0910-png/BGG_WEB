import { BadRequestException, Body, Controller, NotFoundException, Post } from '@nestjs/common';
import sql from 'mssql';
import { DatabaseService } from '../../infrastructure/database/database.service.js';

export function rollQrCode(value: unknown): string {
  if (typeof value !== 'string' || !/^((?:NAH|GNA)\d{9}|GNA[0-9a-f]{32})$/i.test(value.trim()))
    throw new BadRequestException('Vui lòng quét tem QR cây nguyên liệu đã in từ phiếu giám định.');
  return value.trim().toUpperCase();
}
export function rollQuantity(value: unknown): number {
  const text = typeof value === 'string' ? value.trim().replace(',', '.') : String(value);
  if (!/^\d+(\.\d{1,4})?$/.test(text) || Number(text) <= 0 || Number(text) > 9999999999.9999)
    throw new BadRequestException('Số lượng phải lớn hơn 0, tối đa 4 số lẻ và không quá 9.999.999.999,9999.');
  return Number(text);
}
export function receiptId(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new BadRequestException('Vui lòng chọn phiếu giám định.');
  return id;
}

@Controller('mapping-qr/roll-label')
export class InspectionRollQrController {
  constructor(private readonly database: DatabaseService) {}

  @Post('receipts')
  async receipts(@Body() body: { Keyword?: unknown; Status?: unknown; MappingStatus?: unknown; CustomerId?: unknown;
    Type?: unknown; Creator?: unknown; Inspector?: unknown; FromDate?: unknown; ToDate?: unknown; Page?: unknown; PageSize?: unknown }) {
    const text = (value: unknown, max = 100) => typeof value === 'string' ? value.trim().slice(0, max) : '';
    const keyword = text(body?.Keyword).replace(/[~%_\[]/g, '~$&');
    const mapping = text(body.MappingStatus) || 'all';
    if (!['all', 'pending', 'unmapped', 'partial', 'mapped'].includes(mapping)) throw new BadRequestException('Bộ lọc mapping không hợp lệ.');
    const date = (value: unknown): Date | null => {
      if (value == null || value === '') return null;
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException('Ngày lọc không hợp lệ.');
      const result = new Date(value + 'T00:00:00Z');
      if (!Number.isFinite(result.getTime()) || result.toISOString().slice(0, 10) !== value) throw new BadRequestException('Ngày lọc không hợp lệ.');
      return result;
    };
    const from = date(body.FromDate), to = date(body.ToDate);
    if (from && to && from > to) throw new BadRequestException('Từ ngày không được lớn hơn đến ngày.');
    const page = receiptId(body.Page ?? 1), size = receiptId(body.PageSize ?? 20);
    if (page > 1000000 || size > 100) throw new BadRequestException('Trang hoặc số dòng không hợp lệ.');
    const customer = body.CustomerId == null || body.CustomerId === '' ? null : receiptId(body.CustomerId);
    const pool = await this.database.getPool();
    const result = await pool.request().input('Keyword', sql.NVarChar(302), '%' + keyword + '%')
      .input('Status', sql.NVarChar(50), text(body.Status, 50)).input('Mapping', sql.NVarChar(20), mapping)
      .input('Customer', sql.BigInt, customer).input('Type', sql.NVarChar(50), text(body.Type, 50))
      .input('Creator', sql.NVarChar(500), text(body.Creator, 500)).input('Inspector', sql.NVarChar(500), text(body.Inspector, 500))
      .input('From', sql.Date, from).input('To', sql.Date, to).input('Offset', sql.Int, (page - 1) * size).input('Size', sql.Int, size).query(`
WITH Labels AS (SELECT PGDId,COUNT(*) AS TotalLabels,
 SUM(CASE WHEN CayId IS NULL THEN 1 ELSE 0 END) AS PendingLabels,
 SUM(CASE WHEN CayId IS NOT NULL THEN 1 ELSE 0 END) AS MappedLabels,
 MAX(CreatedAt) AS LastLabelAt,MAX(NULLIF(ChungTu,N'')) AS ChungTu,COUNT(DISTINCT NULLIF(ChungTu,N'')) AS CertificateCount
 FROM dbo.WH_InspectionRollQr_Info GROUP BY PGDId)
SELECT p.PGDId,p.MaPhieu,p.Lo AS LoPhieu,p.TrangThai AS TrangThaiPhieu,p.NgayGiamDinh,p.NgayNhanNL,
 p.MaHang,p.DanhSachPO,p.LoaiHinh,p.KHId,COALESCE(NULLIF(k.TenNgan,N''),k.TenDayDu) AS KhachHang,
 p.TenNguoiTao,p.TenNguoiGiamDinh,p.MaKhoNhaMay,p.ReceiptNotesId,
 ISNULL(q.TotalLabels,0) AS TotalLabels,ISNULL(q.PendingLabels,0) AS PendingLabels,ISNULL(q.MappedLabels,0) AS MappedLabels,q.LastLabelAt,q.ChungTu,ISNULL(q.CertificateCount,0) AS CertificateCount
INTO #Matches FROM dbo.WH_PhieuGiamDinh p LEFT JOIN Labels q ON q.PGDId=p.PGDId
LEFT JOIN dbo.Lib_KhachHang k ON k.KHId=p.KHId
WHERE p.LoaiGiamDinh=N'nl'
 AND (@Status=N'' OR p.TrangThai=@Status) AND (@Type=N'' OR p.LoaiHinh=@Type)
 AND (@Customer IS NULL OR p.KHId=@Customer)
 AND (@Creator=N'' OR p.TenNguoiTao=@Creator) AND (@Inspector=N'' OR p.TenNguoiGiamDinh=@Inspector)
 AND (@From IS NULL OR p.NgayGiamDinh>=@From) AND (@To IS NULL OR p.NgayGiamDinh<DATEADD(day,1,@To))
 AND (@Mapping='all' OR (@Mapping='pending' AND q.PendingLabels>0) OR (@Mapping='unmapped' AND ISNULL(q.MappedLabels,0)=0)
  OR (@Mapping='partial' AND q.MappedLabels>0 AND q.PendingLabels>0) OR (@Mapping='mapped' AND q.PendingLabels=0 AND q.MappedLabels>0))
 AND (@Keyword=N'%%' OR p.MaPhieu LIKE @Keyword ESCAPE N'~' OR p.MaHang LIKE @Keyword ESCAPE N'~'
  OR p.Lo LIKE @Keyword ESCAPE N'~' OR p.DanhSachPO LIKE @Keyword ESCAPE N'~'
  OR k.TenNgan LIKE @Keyword ESCAPE N'~' OR k.TenDayDu LIKE @Keyword ESCAPE N'~'
  OR p.TenNguoiTao LIKE @Keyword ESCAPE N'~' OR p.TenNguoiGiamDinh LIKE @Keyword ESCAPE N'~'
  OR p.ReceiptNotesId LIKE @Keyword ESCAPE N'~'
  OR EXISTS(SELECT 1 FROM dbo.WH_InspectionRollQr_Info i WHERE i.PGDId=p.PGDId AND
   (i.Qr LIKE @Keyword ESCAPE N'~' OR i.Item LIKE @Keyword ESCAPE N'~' OR i.TenVatTu LIKE @Keyword ESCAPE N'~'
    OR i.MaMau LIKE @Keyword ESCAPE N'~' OR i.CodeMauVai LIKE @Keyword ESCAPE N'~' OR i.ChungTu LIKE @Keyword ESCAPE N'~')));
SELECT COUNT(*) AS Total FROM #Matches;
SELECT * FROM #Matches ORDER BY NgayGiamDinh DESC,LastLabelAt DESC,PGDId DESC OFFSET @Offset ROWS FETCH NEXT @Size ROWS ONLY;`);
    const sets = Array.isArray(result.recordsets) ? result.recordsets : Object.values(result.recordsets);
    return { success: true, data: sets[1] ?? [], total: sets[0]?.[0]?.Total ?? 0, page, pageSize: size };
  }

  @Post('receipt-filters')
  async receiptFilters() {
    const pool = await this.database.getPool();
    const result = await pool.request().query(`SELECT p.KHId,COALESCE(NULLIF(k.TenNgan,N''),k.TenDayDu) AS KhachHang,
p.TrangThai,p.LoaiHinh,p.TenNguoiTao,p.TenNguoiGiamDinh FROM dbo.WH_PhieuGiamDinh p
LEFT JOIN dbo.Lib_KhachHang k ON k.KHId=p.KHId WHERE p.LoaiGiamDinh=N'nl';`);
    const rows = result.recordset;
    const values = (key: string) => [...new Set(rows.map(row => row[key]).filter((value): value is string => typeof value === 'string' && value.trim() !== ''))].sort();
    const customers = [...new Map(rows.filter(row => Number(row.KHId) > 0 && row.KhachHang).map(row => [Number(row.KHId), { id: Number(row.KHId), name: String(row.KhachHang) }])).values()];
    return { success: true, data: { customers, statuses: values('TrangThai'), types: values('LoaiHinh'), creators: values('TenNguoiTao'), inspectors: values('TenNguoiGiamDinh') } };
  }

  @Post('receipt')
  async receipt(@Body() body: { PGDId?: unknown }) {
    const id = receiptId(body?.PGDId);
    const pool = await this.database.getPool();
    const result = await pool.request().input('PGDId', sql.BigInt, id).query(`
SELECT PGDId,MaPhieu,Lo AS LoPhieu,TrangThai AS TrangThaiPhieu FROM dbo.WH_PhieuGiamDinh WHERE PGDId=@PGDId AND LoaiGiamDinh=N'nl';
SELECT * FROM dbo.WH_InspectionRollQr_Info WHERE PGDId=@PGDId ORDER BY MappedAt DESC,CreatedAt DESC,Qr;`);
    const sets = Array.isArray(result.recordsets) ? result.recordsets : Object.values(result.recordsets);
    if (!sets[0]?.[0]) throw new NotFoundException('Không tìm thấy phiếu giám định nguyên liệu.');
    return { success: true, receipt: sets[0][0], data: sets[1] ?? [] };
  }

  @Post('lookup')
  async lookup(@Body() body: { Qr?: unknown; PGDId?: unknown }) {
    const qr = rollQrCode(body?.Qr);
    const pool = await this.database.getPool();
    const result = await pool.request().input('Qr', sql.NVarChar(50), qr)
      .query('SELECT * FROM dbo.WH_InspectionRollQr_Info WHERE Qr=@Qr');
    if (!result.recordset[0]) throw new NotFoundException('Không tìm thấy tem QR cây nguyên liệu.');
    if (body.PGDId != null && Number(result.recordset[0].PGDId) !== receiptId(body.PGDId))
      throw new BadRequestException('Tem không thuộc phiếu giám định đang chọn.');
    return { success: true, data: result.recordset[0] };
  }

  @Post('map')
  async map(@Body() body: { Qr?: unknown; Quantity?: unknown; SoRoll?: unknown;
    AccountId?: unknown; EmployeeId?: unknown; User?: unknown; PGDId?: unknown; InputUnit?: unknown }) {
    const qr = rollQrCode(body?.Qr);
    const quantity = rollQuantity(body?.Quantity);
    if (typeof body?.SoRoll !== 'string' || !body.SoRoll.trim() || body.SoRoll.trim().length > 250)
      throw new BadRequestException('Số roll phải có từ 1 đến 250 ký tự.');
    const account = Number(body.AccountId), employee = Number(body.EmployeeId);
    if (!Number.isSafeInteger(account) || account <= 0 || !Number.isSafeInteger(employee) || employee <= 0)
      throw new BadRequestException('Thiếu thông tin tài khoản. Vui lòng đăng nhập lại.');
    if (typeof body.User !== 'string' || !body.User.trim() || body.User.length > 500)
      throw new BadRequestException('Thiếu tên người mapping. Vui lòng đăng nhập lại.');
    if (body.InputUnit != null && !['YDS', 'M'].includes(String(body.InputUnit))) throw new BadRequestException('Đơn vị nhập chỉ được là yard hoặc mét.');
    const pool = await this.database.getPool();
    try {
      const request = pool.request().input('Qr', sql.NVarChar(50), qr)
        .input('Quantity', sql.Decimal(18, 4), quantity).input('SoRoll', sql.NVarChar(250), body.SoRoll.trim())
        .input('AccountId', sql.BigInt, account).input('EmployeeId', sql.BigInt, employee)
        .input('User', sql.NVarChar(500), body.User.trim());
      if (body.InputUnit != null) request.input('InputUnit', sql.NVarChar(10), body.InputUnit);
      if (body.PGDId != null) request.input('ExpectedPGDId', sql.BigInt, receiptId(body.PGDId));
      const result = await request.execute('dbo.WH_InspectionRollQr_Map');
      return { success: true, message: result.recordset[0]?.AlreadyMapped ? 'QR đã được mapping trước đó; giữ nguyên cây đã lưu.' : 'Đã lưu cây nguyên liệu.', data: result.recordset[0] };
    } catch (error) {
      const dbError = error as { number?: number; message?: string };
      if (dbError.number && dbError.number >= 50100 && dbError.number <= 50199)
        throw new BadRequestException(dbError.message);
      throw error;
    }
  }

  @Post('update')
  async update(@Body() body: { Qr?: unknown; PGDId?: unknown; Quantity?: unknown; SoRoll?: unknown;
    ExpectedQuantity?: unknown; ExpectedRoll?: unknown; AccountId?: unknown; User?: unknown; InputUnit?: unknown }) {
    const qr = rollQrCode(body?.Qr), id = receiptId(body?.PGDId), quantity = rollQuantity(body?.Quantity);
    const expected = Number(body.ExpectedQuantity), account = Number(body.AccountId);
    if (body.ExpectedQuantity == null || !Number.isFinite(expected) || expected < 0 || expected > 9999999999.9999)
      throw new BadRequestException('Thiếu số lượng gốc để đối chiếu. Vui lòng làm mới danh sách.');
    if (typeof body.SoRoll !== 'string' || !body.SoRoll.trim() || body.SoRoll.trim().length > 250)
      throw new BadRequestException('Vui lòng nhập số roll, tối đa 250 ký tự.');
    if (typeof body.ExpectedRoll !== 'string' || body.ExpectedRoll.length > 250)
      throw new BadRequestException('Thiếu số roll gốc để đối chiếu.');
    if (!Number.isSafeInteger(account) || account <= 0 || typeof body.User !== 'string' || !body.User.trim() || body.User.length > 500)
      throw new BadRequestException('Thiếu thông tin tài khoản. Vui lòng đăng nhập lại.');
    if (body.InputUnit != null && !['YDS', 'M'].includes(String(body.InputUnit))) throw new BadRequestException('Đơn vị nhập chỉ được là yard hoặc mét.');
    const pool = await this.database.getPool();
    try {
      const result = await pool.request().input('Qr', sql.NVarChar(50), qr).input('ExpectedPGDId', sql.BigInt, id)
        .input('ExpectedQuantity', sql.Decimal(18, 4), expected).input('ExpectedRoll', sql.NVarChar(250), body.ExpectedRoll)
        .input('Quantity', sql.Decimal(18, 4), quantity).input('SoRoll', sql.NVarChar(250), body.SoRoll.trim())
        .input('AccountId', sql.BigInt, account).input('User', sql.NVarChar(500), body.User.trim())
        .input('InputUnit', sql.NVarChar(10), body.InputUnit ?? null)
        .execute('dbo.WH_InspectionRollQr_Update');
      return { success: true, message: 'Đã cập nhật thông tin cây.', data: result.recordset[0] };
    } catch (error) {
      const dbError = error as { number?: number; message?: string };
      if (dbError.number && dbError.number >= 50100 && dbError.number <= 50199) throw new BadRequestException(dbError.message);
      throw error;
    }
  }
}
