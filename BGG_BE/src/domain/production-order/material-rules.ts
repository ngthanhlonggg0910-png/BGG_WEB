/**
 * Pure rules used when turning an LSX + PO BOM (OMM_PO_BangDinhMuc) into a material order.
 * Kept in one place so that the BOM list, the order split by warehouse and the
 * server-side re-validation all classify and match lines the same way.
 */

export type LoaiKho = 'NguyenLieu' | 'PhuLieu';

export const LOAI_NPL_LABEL: Record<LoaiKho, string> = {
  NguyenLieu: 'NGUYÊN LIỆU',
  PhuLieu: 'PHỤ LIỆU',
};

function stripAccents(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'D');
}

function hasVietnameseMarks(value: string): boolean {
  return stripAccents(value) !== value;
}

/**
 * Warehouse group of a BOM line.
 *
 * - "PHỤ LIỆU" wins over any fabric keyword, so "Phụ liệu - nhãn vải" stays a trim item.
 * - "VẢI" is only recognised with its accent (or as the word VAI in an unaccented text),
 *   so "Đệm vai" (shoulder pad) is not taken for fabric.
 * - An empty LoaiNPL falls back to MaChungLoai (N.xxx = nguyên liệu), as the desktop app does.
 */
export function classifyLoaiKho(loaiNPL?: string | null, maChungLoai?: string | null): LoaiKho {
  const raw = String(loaiNPL ?? '').normalize('NFC').trim().toUpperCase();
  if (raw) return classifyText(raw);

  const mc = String(maChungLoai ?? '').normalize('NFC').trim().toUpperCase();
  if (!mc) return 'PhuLieu';
  if (mc.startsWith('N.')) return 'NguyenLieu';
  return classifyText(mc);
}

function classifyText(upper: string): LoaiKho {
  const plain = stripAccents(upper);
  if (/\bPHU\s*LIEU\b/.test(plain)) return 'PhuLieu';
  if (/\bNGUYEN\s*LIEU\b/.test(plain)) return 'NguyenLieu';
  if (/\bMEX\b/.test(plain)) return 'NguyenLieu';
  if (/(^|[^\p{L}])VẢI($|[^\p{L}])/u.test(upper)) return 'NguyenLieu';
  if (!hasVietnameseMarks(upper) && /\bVAI\b/.test(upper)) return 'NguyenLieu';
  return 'PhuLieu';
}

export interface LsxRowKey {
  tenMau?: string | null;
  codeMau?: string | null;
  tenSize?: string | null;
}

function norm(value?: string | null): string {
  return String(value ?? '').normalize('NFC').trim().toUpperCase();
}

/** Split a BOM list cell ("RED, BLUE / NAVY", "S;M;L") into exact tokens. */
function tokens(value: string, splitOnSpace: boolean): string[] {
  const re = splitOnSpace ? /[\s,;/|+]+/ : /[,;/|+]+/;
  return value
    .split(re)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Whether a BOM line applies to the colour of an LSX row. Only whole values match:
 * "RED" does not match "DARK RED", "01" does not match "101".
 * A BOM line without colour applies to every row; a row without colour only gets those lines.
 */
export function matchesColor(bomCodeMauSP: string, bomMauSanPham: string, row: LsxRowKey): boolean {
  const rawCode = norm(bomCodeMauSP);
  const rawMau = norm(bomMauSanPham);
  if (!rawCode && !rawMau) return true;
  if (rawCode === 'ALL' || rawMau === 'ALL') return true;

  const candidates = [norm(row.tenMau), norm(row.codeMau)].filter(Boolean);
  if (candidates.length === 0) return false;

  const allowed = new Set<string>();
  if (rawCode) {
    allowed.add(rawCode);
    tokens(rawCode, true).forEach((t) => allowed.add(t));
  }
  if (rawMau) {
    allowed.add(rawMau);
    for (const t of tokens(rawMau, false)) {
      allowed.add(t);
      // "NAVY - 410" / "NAVY (410)": accept each named part as a whole value.
      t.split(/\s+-\s+|[()]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((p) => allowed.add(p));
    }
  }
  return candidates.some((c) => allowed.has(c));
}

/**
 * Whether a BOM line applies to the size of an LSX row, by exact size token
 * ("XS, XL" does not match S or L). ALL / FREE / empty apply to every size.
 */
export function matchesSize(bomSize: string, bomPhoiSize: string, row: LsxRowKey): boolean {
  const rawSize = norm(bomSize);
  const rawPhoi = norm(bomPhoiSize);
  if (!rawSize && !rawPhoi) return true;
  if (['ALL', 'FREE'].includes(rawSize) || (!rawSize && ['ALL', 'FREE'].includes(rawPhoi))) {
    return true;
  }

  const rowSize = norm(row.tenSize);
  if (!rowSize) return false;

  const allowed = new Set<string>([...tokens(rawSize, true), ...tokens(rawPhoi, true)]);
  if (rawSize) allowed.add(rawSize);
  return allowed.has(rowSize);
}

export interface BomDisplaySource {
  Item?: string | null;
  MaMau?: string | null;
  MaChungLoai?: string | null;
  DienGiai?: string | null;
  Size?: string | null;
}

/** Material code / name shown on the order, built from the BOM row (also used to re-check orders). */
export function buildMaterialDisplay(bom: BomDisplaySource): { maVatTu: string; tenVatTu: string } {
  const itemCode = String(bom.Item ?? '').trim();
  const maMau = String(bom.MaMau ?? '').trim();
  const maChungLoai = String(bom.MaChungLoai ?? '').trim();
  const dienGiai = String(bom.DienGiai ?? '').trim();
  const size = String(bom.Size ?? '').trim();

  let maVatTu = itemCode || maChungLoai;
  if (maMau && !maVatTu.toUpperCase().endsWith(`(${maMau.toUpperCase()})`)) {
    maVatTu = `${maVatTu} (${maMau})`.trim();
  }
  maVatTu = maVatTu.substring(0, 50);

  let tenVatTu = dienGiai;
  if (maChungLoai && !tenVatTu.toUpperCase().startsWith(maChungLoai.toUpperCase())) {
    tenVatTu = tenVatTu ? `${maChungLoai} - ${tenVatTu}` : maChungLoai;
  }
  if (size && size.toUpperCase() !== 'ALL') {
    tenVatTu = `${tenVatTu} [Cỡ: ${size}]`.trim();
  }
  tenVatTu = tenVatTu.substring(0, 250);

  return { maVatTu, tenVatTu };
}

/**
 * Departments (Lib_PhongBan.TenPhongBan, compared case- and accent-insensitively) whose accounts
 * may place and cancel LSX material orders.
 */
export const MATERIAL_ORDER_DEPARTMENTS = ['XÍ NGHIỆP MAY 1', 'XÍ NGHIỆP MAY 2', 'DEVELOPER'];

export interface QuyenDatHangLSX {
  datHang: boolean;
  huyDon: boolean;
}
