import { describe, expect, it } from 'vitest';

import { buildMaterialTracking, trangThaiNhan } from './material-tracking.js';

const line = (over: Record<string, unknown>) => ({
  CTDonDatHangId: 1,
  DonDatHangId: 1,
  VTId: 0,
  MaVatTu: 'V1',
  TenVatTu: 'Vải chính',
  DVT: 'm',
  LoaiNPL: 'NGUYÊN LIỆU',
  SoLuongYeuCau: 100,
  SoLuongThucSoan: 0,
  SoLuongXuat: 0,
  SoLuongDaNhan: 0,
  SoCay: 0,
  SoCayDaNhan: 0,
  ...over,
});

describe('trangThaiNhan', () => {
  it('needs at least 100% to be complete', () => {
    expect(trangThaiNhan(100, 0)).toBe('ChuaNhan');
    expect(trangThaiNhan(100, 99.99)).toBe('NhanMotPhan');
    expect(trangThaiNhan(100, 100)).toBe('DaNhanDu');
    expect(trangThaiNhan(100, 120)).toBe('DaNhanDu');
  });
});

describe('buildMaterialTracking', () => {
  const orders = [
    { DonDatHangId: 1, SoDonDatHang: 'DDH-1', LoaiDatHang: 'NguyenLieu', TrangThai: 'DaNhanHang' },
    { DonDatHangId: 2, SoDonDatHang: 'DDH-2', LoaiDatHang: 'NguyenLieu', TrangThai: 'ChoSoanHang' },
    { DonDatHangId: 3, SoDonDatHang: 'DDH-3', LoaiDatHang: 'NguyenLieu', TrangThai: 'DaHuy' },
  ];
  const lines = [
    line({ CTDonDatHangId: 1, DonDatHangId: 1, SoLuongYeuCau: 100, SoLuongDaNhan: 100, SoCay: 2, SoCayDaNhan: 2 }),
    line({ CTDonDatHangId: 2, DonDatHangId: 2, SoLuongYeuCau: 50, SoLuongDaNhan: 20, SoCay: 1, SoCayDaNhan: 1 }),
    line({ CTDonDatHangId: 3, DonDatHangId: 3, SoLuongYeuCau: 999 }),
  ];

  it('sums ordered and received per material over active orders only', () => {
    const { materials } = buildMaterialTracking(orders, lines);
    expect(materials).toHaveLength(1);
    expect(materials[0]).toMatchObject({
      SoLuongDat: 150,
      SoLuongDaNhan: 120,
      SoLuongConLai: 30,
      TrangThaiNhan: 'NhanMotPhan',
    });
    expect(materials[0].donDatHang.map((d) => d.SoDonDatHang)).toEqual(['DDH-1', 'DDH-2']);
  });

  it('reports per-order receipt state and a summary', () => {
    const { orders: out, summary } = buildMaterialTracking(orders, lines);
    expect(out.map((o) => o.TrangThaiNhan)).toEqual(['DaNhanDu', 'NhanMotPhan', 'ChuaNhan']);
    expect(out[2].isDaHuy).toBe(true);
    expect(summary).toEqual({
      soDonHienHanh: 2,
      soDonDaHuy: 1,
      soDonDaNhanDu: 1,
      soMatHang: 1,
      soMatHangDaNhanDu: 0,
      soMatHangConThieu: 1,
    });
  });

  it('never shows a negative remaining quantity when more is received', () => {
    const { materials } = buildMaterialTracking(
      [orders[0]],
      [line({ SoLuongYeuCau: 10, SoLuongDaNhan: 12.5 })],
    );
    expect(materials[0].SoLuongConLai).toBe(0);
    expect(materials[0].TrangThaiNhan).toBe('DaNhanDu');
  });
});
