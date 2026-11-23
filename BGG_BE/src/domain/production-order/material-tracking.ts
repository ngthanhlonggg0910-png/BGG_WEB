/**
 * Theo dõi vật tư của một Lệnh sản xuất: đã đặt (OMM_DonDatHang_LSX_ChiTiet), đã xuất và
 * đã nhận (cây được xí nghiệp xác nhận trên các phiếu soạn còn hiệu lực), còn lại = đặt − nhận.
 * Pure aggregation so it can be unit-tested without a database.
 */

export type TrangThaiNhan = 'ChuaNhan' | 'NhanMotPhan' | 'DaNhanDu';

export interface TrackingOrderRow {
  DonDatHangId: number;
  SoDonDatHang: string;
  LoaiDatHang: string;
  TrangThai: string | null;
  [key: string]: unknown;
}

export interface TrackingLineRow {
  CTDonDatHangId: number;
  DonDatHangId: number;
  VTId: number | null;
  MaVatTu: string | null;
  TenVatTu: string | null;
  DVT: string | null;
  LoaiNPL: string | null;
  SoLuongYeuCau: number | null;
  SoLuongThucSoan: number | null;
  SoLuongXuat: number | null;
  SoLuongDaNhan: number | null;
  SoCay: number | null;
  SoCayDaNhan: number | null;
  ThoiGianNhanMoiNhat?: Date | string | null;
}

export interface TrackingLine {
  CTDonDatHangId: number;
  DonDatHangId: number;
  VTId: number;
  MaVatTu: string;
  TenVatTu: string;
  DVT: string;
  LoaiNPL: string;
  SoLuongDat: number;
  SoLuongThucSoan: number;
  SoLuongXuat: number;
  SoLuongDaNhan: number;
  SoLuongConLai: number;
  SoCay: number;
  SoCayDaNhan: number;
  TrangThaiNhan: TrangThaiNhan;
  ThoiGianNhanMoiNhat: Date | string | null;
}

export interface TrackingOrder extends TrackingOrderRow {
  isDaHuy: boolean;
  SoMatHang: number;
  SoMatHangDaNhanDu: number;
  SoCay: number;
  SoCayDaNhan: number;
  TrangThaiNhan: TrangThaiNhan;
  lines: TrackingLine[];
}

export interface TrackingMaterial {
  key: string;
  LoaiDatHang: string;
  VTId: number;
  MaVatTu: string;
  TenVatTu: string;
  DVT: string;
  SoLuongDat: number;
  SoLuongXuat: number;
  SoLuongDaNhan: number;
  SoLuongConLai: number;
  TrangThaiNhan: TrangThaiNhan;
  donDatHang: Array<{
    DonDatHangId: number;
    SoDonDatHang: string;
    SoLuongDat: number;
    SoLuongDaNhan: number;
  }>;
}

export interface TrackingSummary {
  soDonHienHanh: number;
  soDonDaHuy: number;
  soDonDaNhanDu: number;
  soMatHang: number;
  soMatHangDaNhanDu: number;
  soMatHangConThieu: number;
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown) =>
  typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '';

export function trangThaiNhan(dat: number, daNhan: number): TrangThaiNhan {
  if (daNhan <= 0) return 'ChuaNhan';
  return daNhan >= dat ? 'DaNhanDu' : 'NhanMotPhan';
}

function trangThaiTongHop(items: Array<{ TrangThaiNhan: TrangThaiNhan }>): TrangThaiNhan {
  if (items.length === 0) return 'ChuaNhan';
  if (items.every((i) => i.TrangThaiNhan === 'DaNhanDu')) return 'DaNhanDu';
  if (items.some((i) => i.TrangThaiNhan !== 'ChuaNhan')) return 'NhanMotPhan';
  return 'ChuaNhan';
}

export function buildMaterialTracking(
  orderRows: TrackingOrderRow[],
  lineRows: TrackingLineRow[],
): { orders: TrackingOrder[]; materials: TrackingMaterial[]; summary: TrackingSummary } {
  const linesByOrder = new Map<number, TrackingLine[]>();
  for (const row of lineRows) {
    const dat = round4(num(row.SoLuongYeuCau));
    const daNhan = round4(num(row.SoLuongDaNhan));
    const line: TrackingLine = {
      CTDonDatHangId: num(row.CTDonDatHangId),
      DonDatHangId: num(row.DonDatHangId),
      VTId: num(row.VTId),
      MaVatTu: str(row.MaVatTu),
      TenVatTu: str(row.TenVatTu),
      DVT: str(row.DVT),
      LoaiNPL: str(row.LoaiNPL),
      SoLuongDat: dat,
      SoLuongThucSoan: round4(num(row.SoLuongThucSoan)),
      SoLuongXuat: round4(num(row.SoLuongXuat)),
      SoLuongDaNhan: daNhan,
      SoLuongConLai: round4(Math.max(0, dat - daNhan)),
      SoCay: num(row.SoCay),
      SoCayDaNhan: num(row.SoCayDaNhan),
      TrangThaiNhan: trangThaiNhan(dat, daNhan),
      ThoiGianNhanMoiNhat: row.ThoiGianNhanMoiNhat ?? null,
    };
    if (!linesByOrder.has(line.DonDatHangId)) linesByOrder.set(line.DonDatHangId, []);
    linesByOrder.get(line.DonDatHangId)!.push(line);
  }

  const orders: TrackingOrder[] = orderRows.map((o) => {
    const lines = linesByOrder.get(num(o.DonDatHangId)) ?? [];
    return {
      ...o,
      isDaHuy: str(o.TrangThai).toLowerCase() === 'dahuy',
      SoMatHang: lines.length,
      SoMatHangDaNhanDu: lines.filter((l) => l.TrangThaiNhan === 'DaNhanDu').length,
      SoCay: lines.reduce((s, l) => s + l.SoCay, 0),
      SoCayDaNhan: lines.reduce((s, l) => s + l.SoCayDaNhan, 0),
      TrangThaiNhan: trangThaiTongHop(lines),
      lines,
    };
  });

  // Gộp theo vật tư trên các đơn còn hiệu lực (đơn đã hủy không tính vào số đặt / còn lại).
  const materialMap = new Map<string, TrackingMaterial>();
  for (const order of orders) {
    if (order.isDaHuy) continue;
    for (const line of order.lines) {
      const key = [
        str(order.LoaiDatHang),
        line.MaVatTu.toUpperCase(),
        line.TenVatTu.toUpperCase(),
        line.DVT.toUpperCase(),
      ].join('|');
      let m = materialMap.get(key);
      if (!m) {
        m = {
          key,
          LoaiDatHang: str(order.LoaiDatHang),
          VTId: line.VTId,
          MaVatTu: line.MaVatTu,
          TenVatTu: line.TenVatTu,
          DVT: line.DVT,
          SoLuongDat: 0,
          SoLuongXuat: 0,
          SoLuongDaNhan: 0,
          SoLuongConLai: 0,
          TrangThaiNhan: 'ChuaNhan',
          donDatHang: [],
        };
        materialMap.set(key, m);
      }
      m.SoLuongDat = round4(m.SoLuongDat + line.SoLuongDat);
      m.SoLuongXuat = round4(m.SoLuongXuat + line.SoLuongXuat);
      m.SoLuongDaNhan = round4(m.SoLuongDaNhan + line.SoLuongDaNhan);
      m.donDatHang.push({
        DonDatHangId: order.DonDatHangId,
        SoDonDatHang: order.SoDonDatHang,
        SoLuongDat: line.SoLuongDat,
        SoLuongDaNhan: line.SoLuongDaNhan,
      });
    }
  }

  const materials = Array.from(materialMap.values()).map((m) => ({
    ...m,
    SoLuongConLai: round4(Math.max(0, m.SoLuongDat - m.SoLuongDaNhan)),
    TrangThaiNhan: trangThaiNhan(m.SoLuongDat, m.SoLuongDaNhan),
  }));
  materials.sort((a, b) => {
    if (a.LoaiDatHang !== b.LoaiDatHang) return a.LoaiDatHang === 'NguyenLieu' ? -1 : 1;
    if ((a.SoLuongConLai > 0) !== (b.SoLuongConLai > 0)) return a.SoLuongConLai > 0 ? -1 : 1;
    return a.TenVatTu.localeCompare(b.TenVatTu);
  });

  const active = orders.filter((o) => !o.isDaHuy);
  return {
    orders,
    materials,
    summary: {
      soDonHienHanh: active.length,
      soDonDaHuy: orders.length - active.length,
      soDonDaNhanDu: active.filter((o) => o.TrangThaiNhan === 'DaNhanDu').length,
      soMatHang: materials.length,
      soMatHangDaNhanDu: materials.filter((m) => m.TrangThaiNhan === 'DaNhanDu').length,
      soMatHangConThieu: materials.filter((m) => m.SoLuongConLai > 0).length,
    },
  };
}
